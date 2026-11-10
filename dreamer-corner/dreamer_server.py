#!/usr/bin/env python3
"""The Dream Maker — local staging server (staging only, binds localhost).

Serves the corner page and the job API:
  POST /api/dream  {"description": "..."}  -> creates a job (status awaiting_generation)
  GET  /api/job/<id>                       -> job.json
Run:  python3 dreamer_server.py [port]     (default 8765)
Then open http://localhost:8765/
An agent completes awaiting_generation jobs via Muse's media pipeline +
`dreamer.py finish <id>` — see dreamer.py for the honest seam.
"""
import json, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import dreamer

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self):
        if self.path != "/api/dream":
            return self._json(404, {"error": "not found"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            desc = json.loads(self.rfile.read(n) or b"{}").get("description", "").strip()
            if not desc:
                return self._json(400, {"error": "empty description"})
            self._json(201, dreamer.new_job(desc))
        except Exception as e:  # staging: surface the error plainly
            self._json(500, {"error": str(e)})

    def do_GET(self):
        if self.path.startswith("/api/job/"):
            p = ROOT / "jobs" / self.path.split("/api/job/", 1)[1] / "job.json"
            if p.exists():
                return self._json(200, json.loads(p.read_text()))
            return self._json(404, {"error": "no such job"})
        super().do_GET()

    def log_message(self, *a):
        pass


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8765
    print(f"The Dream Maker staging server on http://localhost:{port}/")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
