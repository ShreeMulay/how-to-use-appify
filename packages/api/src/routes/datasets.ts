/**
 * Datasets API Routes
 * ===================
 * Endpoints for managing Apify datasets.
 */

import { Hono } from "hono";
import { z } from "zod";
import { getApifyClient } from "../services/apify-client";

const datasets = new Hono();
const client = getApifyClient();

// ===========================================================================
// GET /api/datasets - List all datasets
// ===========================================================================
datasets.get("/", async (c) => {
  const limit = parseInt(c.req.query("limit") || "20", 10);
  const offset = parseInt(c.req.query("offset") || "0", 10);
  const unnamed = c.req.query("unnamed") === "true";

  const result = await client.listDatasets({ limit, offset, unnamed });

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
// GET /api/datasets/:datasetId - Get dataset info
// ===========================================================================
datasets.get("/:datasetId", async (c) => {
  const datasetId = c.req.param("datasetId");

  const dataset = await client.getDataset(datasetId);

  return c.json({ data: dataset });
});

// ===========================================================================
// GET /api/datasets/:datasetId/items - Get dataset items
// ===========================================================================
datasets.get("/:datasetId/items", async (c) => {
  const datasetId = c.req.param("datasetId");
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const offset = parseInt(c.req.query("offset") || "0", 10);
  const clean = c.req.query("clean") !== "false";
  const desc = c.req.query("desc") === "true";
  const fields = c.req.query("fields")?.split(",");

  const result = await client.getDatasetItems(datasetId, {
    limit: Math.min(limit, 1000), // Cap at 1000
    offset,
    clean,
    desc,
    fields,
  });

  return c.json({
    data: {
      items: result.items,
      total: result.total,
      offset: result.offset,
      limit: result.limit,
      count: result.count,
    },
  });
});

// ===========================================================================
// POST /api/datasets/:datasetId/items - Push items to dataset
// ===========================================================================
const pushItemsSchema = z.object({
  items: z.array(z.record(z.unknown())).min(1),
});

datasets.post("/:datasetId/items", async (c) => {
  const datasetId = c.req.param("datasetId");
  const body = await c.req.json();

  // Validate input
  const parsed = pushItemsSchema.parse(body);

  await client.pushDatasetItems(datasetId, parsed.items);

  return c.json({
    data: {
      success: true,
      itemsAdded: parsed.items.length,
    },
  }, 201);
});

// ===========================================================================
// GET /api/datasets/:datasetId/download - Download dataset
// ===========================================================================
datasets.get("/:datasetId/download", async (c) => {
  const datasetId = c.req.param("datasetId");
  const format = c.req.query("format") || "json";

  // Get all items (with reasonable limit)
  const result = await client.getDatasetItems(datasetId, {
    limit: 10000,
    clean: true,
  });

  if (format === "csv") {
    // Convert to CSV
    if (result.items.length === 0) {
      return c.text("", 200, {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${datasetId}.csv"`,
      });
    }

    const headers = Object.keys(result.items[0]);
    const csvRows = [
      headers.join(","),
      ...result.items.map((item) =>
        headers
          .map((h) => {
            const val = item[h];
            if (val === null || val === undefined) return "";
            const str = typeof val === "object" ? JSON.stringify(val) : String(val);
            // Escape quotes and wrap in quotes if contains comma
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(",")
      ),
    ];

    return c.text(csvRows.join("\n"), 200, {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${datasetId}.csv"`,
    });
  }

  // Default: JSON
  return c.json(result.items, 200, {
    "Content-Disposition": `attachment; filename="${datasetId}.json"`,
  });
});

// ===========================================================================
// DELETE /api/datasets/:datasetId - Delete dataset
// ===========================================================================
datasets.delete("/:datasetId", async (c) => {
  const datasetId = c.req.param("datasetId");

  await client.deleteDataset(datasetId);

  return c.json({ data: { success: true } });
});

export default datasets;
