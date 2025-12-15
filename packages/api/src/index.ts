/**
 * Apify Learning Lab - API Server
 * ================================
 * Hono-based REST API server that wraps the Apify API.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";

import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import actorsRouter from "./routes/actors";
import datasetsRouter from "./routes/datasets";
import runsRouter from "./routes/runs";
import { getApifyClient } from "./services/apify-client";

// Create the Hono app
const app = new Hono();

// ===========================================================================
// Middleware
// ===========================================================================

// Enable CORS for frontend
app.use(
  "*",
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  })
);

// Request logging
app.use("*", logger());

// Pretty JSON responses in development
if (process.env.NODE_ENV !== "production") {
  app.use("*", prettyJSON());
}

// Error handling
app.use("*", errorHandler());

// ===========================================================================
// Health Check Routes
// ===========================================================================

app.get("/api/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health/apify", async (c) => {
  try {
    const client = getApifyClient();
    const user = await client.getUser();

    return c.json({
      status: "ok",
      apifyConnected: true,
      user: {
        username: user.username,
        email: user.email,
        plan: user.plan?.description || "Unknown",
      },
    });
  } catch (error) {
    return c.json(
      {
        status: "error",
        apifyConnected: false,
        message: error instanceof Error ? error.message : "Connection failed",
      },
      503
    );
  }
});

// ===========================================================================
// API Routes
// ===========================================================================

app.route("/api/actors", actorsRouter);
app.route("/api/datasets", datasetsRouter);
app.route("/api/runs", runsRouter);

// ===========================================================================
// Root Route
// ===========================================================================

app.get("/", (c) => {
  return c.json({
    name: "Apify Learning Lab API",
    version: "1.0.0",
    documentation: "/api",
    endpoints: {
      health: "/api/health",
      healthApify: "/api/health/apify",
      actors: {
        popular: "/api/actors/popular",
        categories: "/api/actors/categories",
        get: "/api/actors/:actorId",
        inputSchema: "/api/actors/:actorId/input-schema",
        run: "/api/actors/:actorId/run",
        runStatus: "/api/actors/:actorId/runs/:runId",
        runLog: "/api/actors/:actorId/runs/:runId/log",
      },
      datasets: {
        list: "/api/datasets",
        get: "/api/datasets/:datasetId",
        items: "/api/datasets/:datasetId/items",
        download: "/api/datasets/:datasetId/download",
      },
      runs: {
        list: "/api/runs",
        get: "/api/runs/:runId",
        log: "/api/runs/:runId/log",
        abort: "/api/runs/:runId/abort",
        resurrect: "/api/runs/:runId/resurrect",
      },
    },
  });
});

// ===========================================================================
// 404 Handler
// ===========================================================================

app.notFound(notFoundHandler);

// ===========================================================================
// Start Server
// ===========================================================================

const port = parseInt(process.env.API_PORT || "3001", 10);

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║   🚀 Apify Learning Lab API Server                          ║
║                                                              ║
║   Server running at: http://localhost:${port}                  ║
║   Health check:      http://localhost:${port}/api/health       ║
║   API docs:          http://localhost:${port}/                 ║
║                                                              ║
║   Press Ctrl+C to stop                                       ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};
