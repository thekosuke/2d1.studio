"""Local review server. No build tools or third-party packages required."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os

os.chdir(Path(__file__).resolve().parent.parent)

class PreviewHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('X-Robots-Tag', 'noindex, nofollow')
        super().end_headers()

print('2D1 preview: http://localhost:4173', flush=True)
ThreadingHTTPServer(('127.0.0.1', 4173), PreviewHandler).serve_forever()
