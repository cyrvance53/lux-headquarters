#!/usr/bin/env node
/**
 * The Dream Maker — MCP server (staging, localhost only).
 *
 * Exposes the existing Dream Maker job pipeline (dreamer.py) as two MCP
 * tools for the LibreChat staging desk:
 *   - make_dream    (display name: The Dream Maker) — create a job from a
 *                   scene description; returns job id + status.
 *   - dream_result  — given a job id, return its status, and when finished
 *                   the clip URL served by dreamer_server.py.
 *
 * The generation seam is unchanged and honest: make_dream only creates the
 * job (status "awaiting_generation"). An agent must generate master.mp4
 * into the job folder via Muse's media pipeline, then `dreamer.py finish`
 * completes it. dream_result reports whatever the real job state is.
 *
 * Transport: stdio (LibreChat spawns this process per its mcpServers config).
 * No credentials are used or stored by this server.
 * SDK: resolves @modelcontextprotocol/sdk + zod from the LibreChat install
 * (~/workspace/tools/librechat/node_modules) — no new installs.
 */
import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CORNER = path.resolve(HERE, '..');
const DREAMER_PY = path.join(CORNER, 'dreamer.py');
const JOBS = path.join(CORNER, 'jobs');
const CLIP_BASE = process.env.DREAM_MAKER_BASE_URL || 'http://localhost:8765';

function runDreamer(args) {
  return new Promise((resolve, reject) => {
    execFile('python3', [DREAMER_PY, ...args], { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) reject(new Error((stderr || stdout || err.message).trim()));
      else resolve(stdout);
    });
  });
}

async function readJob(jobId) {
  if (!/^[A-Za-z0-9._-]+$/.test(jobId)) throw new Error('invalid job id');
  const raw = await readFile(path.join(JOBS, jobId, 'job.json'), 'utf8');
  return JSON.parse(raw);
}

function jobView(job) {
  const view = {
    job_id: job.id,
    service: 'The Dream Maker',
    status: job.status,
    description: job.description,
  };
  if (job.status === 'done') {
    view.clip_url = `${CLIP_BASE}/jobs/${job.id}/scene.mp4`;
    view.song = job.song;
    if (job.qa) view.qa = job.qa;
  } else {
    view.note =
      'The scene is not generated yet. An agent generates master.mp4 into the job folder via Muse\'s media pipeline, then runs `dreamer.py finish ' +
      job.id +
      '`. Poll dream_result with this job_id.';
  }
  return view;
}

const text = (obj) => ({
  content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }],
});

const server = new McpServer({ name: 'dream-maker', version: '0.1.0' });

server.registerTool(
  'make_dream',
  {
    title: 'The Dream Maker',
    description:
      'The Dream Maker: create a dream scene job from a visitor\'s scene description. ' +
      'Call this whenever a visitor asks for a dream / dream scene / short dreamlike video of something. ' +
      'Returns a job_id and status. The job starts as "awaiting_generation"; after it is finished, ' +
      'use dream_result with the job_id to get the finished clip URL and show it to the visitor.',
    inputSchema: {
      description: z
        .string()
        .min(3)
        .describe('The scene the visitor wants dreamed, in their own words, e.g. "a lighthouse on a rocky shore at dawn with gulls".'),
    },
  },
  async ({ description }) => {
    const out = await runDreamer(['new', description]);
    return text(jobView(JSON.parse(out)));
  },
);

server.registerTool(
  'dream_result',
  {
    title: 'The Dream Maker — Result',
    description:
      'Check a Dream Maker job by job_id. If finished, returns the finished clip URL (clip_url) ' +
      'served by the Dream Maker staging server — present that URL to the visitor in the conversation. ' +
      'If not finished, returns the current status.',
    inputSchema: {
      job_id: z.string().min(1).describe('The job_id returned by make_dream.'),
    },
  },
  async ({ job_id }) => text(jobView(await readJob(job_id))),
);

await server.connect(new StdioServerTransport());
console.error('dream-maker MCP server ready (stdio)');
