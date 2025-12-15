/**
 * Runs API Routes
 * ===============
 * Endpoints for managing actor runs.
 */

import { Hono } from "hono";
import { getApifyClient } from "../services/apify-client";

const runs = new Hono();
const client = getApifyClient();

// ===========================================================================
// GET /api/runs - List all runs
// ===========================================================================
runs.get("/", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const offset = parseInt(c.req.query("offset") || "0", 10);
  const status = c.req.query("status");
  const actorId = c.req.query("actorId");

  const result = await client.listRuns({
    limit: Math.min(limit, 100),
    offset,
    status: status || undefined,
    actorId: actorId || undefined,
  });

  return c.json({
    data: {
      items: result.items,
      total: result.total,
      offset: result.offset,
      limit: result.limit,
    },
  });
});

// ===========================================================================
// GET /api/runs/:runId - Get run details
// ===========================================================================
runs.get("/:runId", async (c) => {
  const runId = c.req.param("runId");

  const run = await client.getRun(runId);

  return c.json({ data: run });
});

// ===========================================================================
// GET /api/runs/:runId/log - Get run log
// ===========================================================================
runs.get("/:runId/log", async (c) => {
  const runId = c.req.param("runId");

  const log = await client.getRunLog(runId);

  return c.json({ data: { log } });
});

// ===========================================================================
// POST /api/runs/:runId/abort - Abort a run
// ===========================================================================
runs.post("/:runId/abort", async (c) => {
  const runId = c.req.param("runId");

  const run = await client.abortRun(runId);

  return c.json({ data: run });
});

// ===========================================================================
// POST /api/runs/:runId/resurrect - Resurrect a run
// ===========================================================================
runs.post("/:runId/resurrect", async (c) => {
  const runId = c.req.param("runId");

  const run = await client.resurrectRun(runId);

  return c.json({ data: run });
});

export default runs;
