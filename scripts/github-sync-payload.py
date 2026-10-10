#!/usr/bin/env python3
"""Read local files for an approved connector sync; never access the network."""

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import stat


MAX_CHUNK = 600_000  # Multiple of three: interior base64 chunks have no padding.


def identity(info):
    return (info.st_dev, info.st_ino, info.st_size, info.st_mtime_ns,
            info.st_ctime_ns, info.st_mode)


def inspect_file(path, offset=None, length=MAX_CHUNK):
    """Hash in bounded reads; capture at most one chunk of the same file pass."""
    before = path.lstat()
    if not stat.S_ISREG(before.st_mode):
        raise ValueError(f"not a regular file (symlinks unsupported): {path}")
    size = before.st_size
    if offset is not None:
        if not 0 <= offset <= size or offset % 3:
            raise ValueError("offset must be in range and a multiple of three")
        count = min(length, size - offset)
        if offset + count < size and count % 3:
            raise ValueError("non-final chunk length must be a multiple of three")
    blob = hashlib.sha1(f"blob {size}\0".encode("ascii"))
    whole = hashlib.sha256()
    captured = bytearray()
    position = 0
    with path.open("rb") as source:
        if identity(os.fstat(source.fileno())) != identity(before):
            raise ValueError(f"file changed before reading: {path}")
        while data := source.read(MAX_CHUNK):
            blob.update(data)
            whole.update(data)
            if offset is not None:
                start = max(position, offset)
                end = min(position + len(data), offset + count)
                if start < end:
                    captured.extend(data[start - position:end - position])
            position += len(data)
        after = os.fstat(source.fileno())
    if (position != size or identity(before) != identity(after)
            or identity(before) != identity(path.lstat())):
        raise ValueError(f"file changed while reading; refresh manifest: {path}")
    metadata = {
        "path": path.as_posix(), "size": size,
        "mode": "100755" if before.st_mode & 0o111 else "100644",
        "blobSHA": blob.hexdigest(), "sha256": whole.hexdigest(),
    }
    if offset is not None:
        if len(captured) != count:
            raise ValueError("short chunk read")
        encoded = base64.b64encode(captured).decode("ascii")
        metadata.update({
            "offset": offset, "byteCount": len(captured),
            "nextOffset": offset + len(captured),
            "eof": offset + len(captured) == size,
            "chunkSHA256": hashlib.sha256(captured).hexdigest(),
            "base64Length": len(encoded), "base64": encoded,
        })
    return metadata


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    manifest = commands.add_parser("manifest", help="hash explicit approved files")
    manifest.add_argument("paths", nargs="+", type=Path)
    chunk = commands.add_parser("chunk", help="emit one bounded base64 JSON payload")
    chunk.add_argument("path", type=Path)
    chunk.add_argument("--offset", type=int, default=0)
    chunk.add_argument("--length", type=int, default=MAX_CHUNK)
    chunk.add_argument("--expect-size", type=int, required=True)
    chunk.add_argument("--expect-blob-sha", required=True)
    args = parser.parse_args()
    try:
        if args.command == "manifest":
            result = {"version": 1, "files": [inspect_file(p) for p in args.paths]}
        else:
            if not 1 <= args.length <= MAX_CHUNK:
                raise ValueError(f"length must be between 1 and {MAX_CHUNK}")
            result = inspect_file(args.path, args.offset, args.length)
            if (result["size"] != args.expect_size
                    or result["blobSHA"] != args.expect_blob_sha):
                raise ValueError("file differs from manifest; do not upload")
        print(json.dumps(result, separators=(",", ":")))
    except (OSError, ValueError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
