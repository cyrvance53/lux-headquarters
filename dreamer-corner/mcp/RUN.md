# The Dream Maker — MCP server (staging) — Run Notes

Wires the Dream Maker job pipeline (`../dreamer.py`) into the LibreChat staging desk as a callable tool.

## What it is

- `server.mjs` — a small MCP server (stdio transport) exposing two tools:
  - `make_dream` (display name: **The Dream Maker**) — takes a scene description, creates a job via `dreamer.py new`, returns `job_id` + `status` (`awaiting_generation`).
  - `dream_result` — takes a `job_id`, returns the job's current status; when `done`, also `clip_url` served by `dreamer_server.py` (default base `http://localhost:8765`, override with env `DREAM_MAKER_BASE_URL`).
- Dependencies: `@modelcontextprotocol/sdk` + `zod`, resolved through the `node_modules` symlink in this folder → `~/workspace/tools/librechat/node_modules` (the LibreChat install). No separate install, no credentials used or stored.
- The generation seam is unchanged: a job waits at `awaiting_generation` until an agent generates `jobs/<id>/master.mp4` via Muse's media pipeline and runs `python3 ../dreamer.py finish <id>`.

## Start / stop

There is no standalone daemon to start for LibreChat use: **LibreChat spawns this server itself** from the `mcpServers.dream-maker` entry in `~/workspace/tools/librechat/librechat.yaml` (stdio, `node …/mcp/server.mjs`).

- Start the whole desk stack: `~/workspace/tools/librechat/start-lux.sh` (the log shows `[MCP][dream-maker] Tools: make_dream, dream_result` when it connects), plus the clip server: `cd ../ && python3 dreamer_server.py` (http://localhost:8765).
- Stop: `~/workspace/tools/librechat/stop-lux.sh` (the spawned MCP process dies with LibreChat) and stop the `dreamer_server.py` process (`pkill -f dreamer_server.py`).

Standalone check (optional): run `node server.mjs` — it speaks MCP on stdio and logs `dream-maker MCP server ready (stdio)` to stderr; Ctrl-C stops it.

## Desk agent (staging)

One neutral agent in LibreChat, **"Lux Desk — Staging"** (id `agent_-Q1pVH2LslGojLtntI9GX`), model Groq `openai/gpt-oss-120b`, with tools `make_dream_mcp_dream-maker` and `dream_result_mcp_dream-maker` attached. Its instructions are functional tool-routing only — no persona (Chair's Hold).
