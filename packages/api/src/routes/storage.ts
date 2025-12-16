/**
 * Storage (Key-Value Store) API Routes
 * =====================================
 * Endpoints for managing Apify Key-Value Stores.
 */

import { Hono } from "hono";
import { z } from "zod";
import { getApifyClient } from "../services/apify-client";

const storage = new Hono();
const client = getApifyClient();

// ===========================================================================
// GET /api/storage - List all key-value stores
// ===========================================================================
storage.get("/", async (c) => {
  const limit = Number.parseInt(c.req.query("limit") || "20", 10);
  const offset = Number.parseInt(c.req.query("offset") || "0", 10);
  const unnamed = c.req.query("unnamed") === "true";

  const result = await client.listKeyValueStores({ limit, offset, unnamed });

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
// GET /api/storage/:storeId - Get key-value store info
// ===========================================================================
storage.get("/:storeId", async (c) => {
  const storeId = c.req.param("storeId");

  const store = await client.getKeyValueStore(storeId);

  return c.json({ data: store });
});

// ===========================================================================
// GET /api/storage/:storeId/keys - List records in a key-value store
// ===========================================================================
storage.get("/:storeId/keys", async (c) => {
  const storeId = c.req.param("storeId");
  const limit = Number.parseInt(c.req.query("limit") || "100", 10);
  const exclusiveStartKey = c.req.query("exclusiveStartKey");

  const result = await client.listKeyValueRecords(storeId, {
    limit: Math.min(limit, 1000), // Cap at 1000
    exclusiveStartKey,
  });

  return c.json({
    data: {
      items: result.items,
      count: result.count,
      limit: result.limit,
      isTruncated: result.isTruncated,
      exclusiveStartKey: result.exclusiveStartKey,
      nextExclusiveStartKey: result.nextExclusiveStartKey,
    },
  });
});

// ===========================================================================
// GET /api/storage/:storeId/records/:key - Get a record from key-value store
// ===========================================================================
storage.get("/:storeId/records/:key", async (c) => {
  const storeId = c.req.param("storeId");
  const key = c.req.param("key");

  const value = await client.getKeyValueRecord(storeId, key);

  return c.json({ data: { key, value } });
});

// ===========================================================================
// PUT /api/storage/:storeId/records/:key - Set a record in key-value store
// ===========================================================================
const setRecordSchema = z.object({
  value: z.unknown(),
  contentType: z.string().optional().default("application/json"),
});

storage.put("/:storeId/records/:key", async (c) => {
  const storeId = c.req.param("storeId");
  const key = c.req.param("key");
  const body = await c.req.json();

  // Validate input
  const parsed = setRecordSchema.parse(body);

  await client.setKeyValueRecord(storeId, key, parsed.value, parsed.contentType);

  return c.json({
    data: {
      success: true,
      key,
    },
  }, 201);
});

// ===========================================================================
// DELETE /api/storage/:storeId/records/:key - Delete a record
// ===========================================================================
storage.delete("/:storeId/records/:key", async (c) => {
  const storeId = c.req.param("storeId");
  const key = c.req.param("key");

  await client.deleteKeyValueRecord(storeId, key);

  return c.json({ data: { success: true, key } });
});

// ===========================================================================
// DELETE /api/storage/:storeId - Delete key-value store
// ===========================================================================
storage.delete("/:storeId", async (c) => {
  const storeId = c.req.param("storeId");

  await client.deleteKeyValueStore(storeId);

  return c.json({ data: { success: true } });
});

export default storage;
