/**
 * Actors API Routes
 * =================
 * Endpoints for managing and running Apify actors.
 */

import { Hono } from "hono";
import { z } from "zod";
import { getApifyClient } from "../services/apify-client";
import {
  POPULAR_ACTORS,
  getActorsByCategory,
  getActorsByDifficulty,
  searchActors,
  getActorById,
  getCategories,
} from "../data/popular-actors";

const actors = new Hono();
const client = getApifyClient();

// ===========================================================================
// GET /api/actors/popular - Get curated list of popular actors
// ===========================================================================
actors.get("/popular", async (c) => {
  const category = c.req.query("category");
  const difficulty = c.req.query("difficulty");
  const search = c.req.query("search");

  let result = [...POPULAR_ACTORS];

  if (category) {
    result = getActorsByCategory(category);
  }

  if (difficulty) {
    result = result.filter((a) => a.difficulty === difficulty);
  }

  if (search) {
    const searchResults = searchActors(search);
    result = result.filter((a) => searchResults.some((s) => s.id === a.id));
  }

  return c.json({
    data: result,
    meta: {
      total: result.length,
      categories: getCategories(),
    },
  });
});

// ===========================================================================
// GET /api/actors/categories - Get available categories
// ===========================================================================
actors.get("/categories", async (c) => {
  const categories = getCategories();
  
  const categoryInfo = categories.map((cat) => ({
    id: cat,
    name: cat.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    count: getActorsByCategory(cat).length,
  }));

  return c.json({ data: categoryInfo });
});

// ===========================================================================
// GET /api/actors/:actorId - Get actor details
// ===========================================================================
actors.get("/:actorId{.+}", async (c) => {
  const actorId = c.req.param("actorId");
  
  // Check if it's a "run" or "runs" sub-route
  if (actorId.includes("/runs") || actorId.includes("/run")) {
    return c.notFound();
  }

  // First check our curated list
  const popularActor = getActorById(actorId);

  // Then get full details from Apify API
  const actor = await client.getActor(actorId);

  return c.json({
    data: {
      ...actor,
      // Add our curated metadata if available
      curated: popularActor
        ? {
            category: popularActor.category,
            difficulty: popularActor.difficulty,
            estimatedCost: popularActor.estimatedCost,
            exampleInput: popularActor.exampleInput,
          }
        : null,
    },
  });
});

// ===========================================================================
// GET /api/actors/:actorId/input-schema - Get actor input schema
// ===========================================================================
actors.get("/:actorId{.+}/input-schema", async (c) => {
  const actorId = c.req.param("actorId");

  const schema = await client.getActorInputSchema(actorId);

  if (!schema) {
    // Return example input from curated list if available
    const popularActor = getActorById(actorId);
    if (popularActor?.exampleInput) {
      return c.json({
        data: {
          type: "example",
          exampleInput: popularActor.exampleInput,
          message: "Full input schema not available. Use example input as reference.",
        },
      });
    }

    return c.json(
      {
        error: {
          type: "not_found",
          message: "Input schema not found for this actor",
        },
      },
      404
    );
  }

  return c.json({ data: schema });
});

// ===========================================================================
// POST /api/actors/:actorId/run - Run an actor
// ===========================================================================
const runActorSchema = z.object({
  input: z.record(z.unknown()).optional(),
  options: z
    .object({
      build: z.string().optional(),
      memory: z.number().min(128).max(32768).optional(),
      timeout: z.number().min(0).max(3600).optional(),
      waitForFinish: z.number().min(0).max(300).optional(),
    })
    .optional(),
});

actors.post("/:actorId{.+}/run", async (c) => {
  const actorId = c.req.param("actorId");
  const body = await c.req.json();

  // Validate input
  const parsed = runActorSchema.parse(body);

  const run = await client.runActor(actorId, {
    input: parsed.input,
    options: parsed.options,
  });

  return c.json({ data: run }, 201);
});

// ===========================================================================
// GET /api/actors/:actorId/runs/:runId - Get run status
// ===========================================================================
actors.get("/:actorId{.+}/runs/:runId", async (c) => {
  const runId = c.req.param("runId");

  const run = await client.getRun(runId);

  return c.json({ data: run });
});

// ===========================================================================
// GET /api/actors/:actorId/runs/:runId/log - Get run log
// ===========================================================================
actors.get("/:actorId{.+}/runs/:runId/log", async (c) => {
  const runId = c.req.param("runId");

  const log = await client.getRunLog(runId);

  return c.json({ data: { log } });
});

// ===========================================================================
// POST /api/actors/:actorId/runs/:runId/abort - Abort a run
// ===========================================================================
actors.post("/:actorId{.+}/runs/:runId/abort", async (c) => {
  const runId = c.req.param("runId");

  const run = await client.abortRun(runId);

  return c.json({ data: run });
});

export default actors;
