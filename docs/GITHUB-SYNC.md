# GitHub sync checkpoints

Use this process for each explicitly approved batch on `site-redesign`.
Follow the current user-approved synchronization scope; ask only when required authority is missing.
Syncing source does not authorize merging,
deployment, DNS changes, or authentication changes. Use the connected GitHub
tools; never extract credentials or bypass them with direct API calls.

## Known limits

On 10 October 2026, sequential connector `create_blob` calls with base64 content
produced all 176 image blobs for this checkpoint with matching Git SHAs, including
the largest 8,829,006-byte image. An earlier concurrent upload
batch ended with “aborted by user after 21.6s”; no GitHub write error was exposed,
so its root cause is unproven. Separately, reading a whole large image as base64
through `exec_command` stdout truncated near 1 MiB. Neither event justifies
blind retries or changing credentials.

A later tree request containing all238 entries and2,655,077 characters of inline
source content exposed no result before interruption after472.1seconds. Read-only
checks still returned404 for its expected tree; its cause is also unproven. Keep
tree requests compact: upload text files as sequential blobs too, then use only
path/mode/type/SHA entries in `create_tree`. This avoids repeating that large
inline-content request without claiming GitHub itself rejected its size.

## Prepare and read bytes

1. Confirm the repository, branch, approved scope, and current remote head/tree.
   Inventory tracked, untracked, deleted, and generated files. Include all final
   approved source, assets, tests, and documentation, including handoff updates;
   exclude secrets, transient output, and `.DS_Store`. Preserve concurrent edits.
2. Run the relevant local checks against the final source (`npm test` plus
   applicable focused checks). No GitHub Actions workflows are configured at
   this checkpoint; a source push is not evidence of CI or deployment.
3. From the repository root, save a fresh manifest outside the committed tree:

   ```sh
   python3 scripts/github-sync-payload.py manifest path/to/file.png path/to/source.js > /tmp/sync-manifest.json
   python3 scripts/github-sync-payload.py chunk path/to/file.png --offset 0 --length 600000 --expect-size SIZE --expect-blob-sha SHA
   ```

   Replace `SIZE` and `SHA` with that file's manifest values. The helper reads
   regular files only, bounds each disk read and captured payload to 600,000 raw
   bytes, hashes Git's `blob <size>\0` header plus content, and rejects changes
   observed during reading or a mismatch with the expected manifest. It emits
   whole-file `size`, `mode`, `blobSHA` (Git SHA-1), and `sha256`. A chunk also
   includes `offset`, actual `byteCount`, `nextOffset`, `eof`, `chunkSHA256`,
   `base64Length`, and `base64`. Symlinks require separate deliberate handling.
4. Consume chunk JSON programmatically. Check the process succeeded and output
   is complete; tool token budgets can truncate even a bounded chunk, so reduce
   `--length` if needed. Check path, size, mode, and whole-file hashes against
   the manifest; require contiguous offsets and the expected actual byte count.
   Strictly decode each chunk, require `base64Length == 4 * ceil(byteCount / 3)`,
   verify decoded length and `chunkSHA256`, and advance by `nextOffset` until
   `eof`. Every intermediate raw chunk and offset must be a multiple of three.
   Concatenate encoded chunks in memory: padding belongs only at the end.
   Verify total size, SHA-256, and Git blob SHA of the reconstructed bytes.
   Never print a whole assembled image through stdout or upload chunks as
   separate file blobs. Recheck the fresh manifest before finalizing the tree.

## Write, checkpoint, verify

1. Allow **one GitHub mutation at a time**, awaiting and inspecting its result
   before the next. Do not start parallel mutation promises. A serial loop must
   checkpoint each file and expose progress before continuing. Send each assembled
   binary file through `create_blob(encoding="base64")` and each text file through
   `create_blob(encoding="utf-8")`, and
   require its returned SHA to equal the manifest's exact `blobSHA`.
2. After every verified success, durably checkpoint a per-file ledger outside
   the committed tree. Record repository, branch, base head, path, mode, size,
   local SHA-256, expected blob SHA, returned blob SHA, and verified status.
   Atomically replace and flush the ledger to disk before the next mutation.
   Also checkpoint tree/commit/ref results. An in-memory list is not a ledger.
3. Stop on the first error, SHA mismatch, interruption, or uncertain outcome.
   Preserve the last checkpoint and exact error. Reconcile through read-only
   remote inspection before resuming: verify objects by SHA and read the branch
   head. Do not assume an interrupted write failed or retry it blindly. Reuse
   verified blobs only when they still match a fresh local manifest.
4. Read the remote head before creating the tree, again before the commit, and
   immediately before updating the ref. If it changed, reconcile remote and
   local edits first; never overwrite newer work. Build on the current base
   tree using compact SHA-only entries and use its head as commit parent. This
   checkpoint permits additions/modifications only and retains every existing
   remote path; do not include deletion entries or perform cleanup.
   Refresh the full local inventory so late source/docs changes are included.
5. Update the ref without force, using `expected_sha` equal to the inspected
   parent head as a lease. If the connector cannot enforce that lease, stop and
   choose an authorized supported safe flow; never drop the guard. A rejected
   lease requires reconciliation, not a force push.
6. Read back the final ref, commit, and complete recursive Git tree. If a tree
   response is truncated, walk its subtrees. Compare the full expected path,
   mode, type, and SHA map, including preserved remote paths and deletions;
   independently match every changed file's SHA against the final manifest.
   Record the verified commit and local test results. Report any unchecked or
   blocked stage plainly; only then call the approved batch synchronized.
