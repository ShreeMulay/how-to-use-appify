/**
 * Error Handler Middleware
 * ========================
 * Global error handling for the Hono API server.
 */

import type { Context } from "hono";
import { ApifyError } from "../services/apify-client";

/**
 * Standard error response format
 */
interface ErrorResponse {
  error: {
    type: string;
    message: string;
    statusCode: number;
  };
}

/**
 * Handle errors and return appropriate responses
 */
export function handleError(error: unknown, c: Context): Response {
  console.error("API Error:", error);

  // Handle Apify API errors
  if (error instanceof ApifyError) {
    const response: ErrorResponse = {
      error: {
        type: "apify_error",
        message: error.apiMessage,
        statusCode: error.statusCode,
      },
    };

    return c.json(response, error.statusCode as 400 | 401 | 403 | 404 | 500);
  }

  // Handle validation errors (Zod)
  if (error && typeof error === "object" && "issues" in error) {
    const zodError = error as { issues: Array<{ path: string[]; message: string }> };
    const response: ErrorResponse = {
      error: {
        type: "validation_error",
        message: zodError.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
        statusCode: 400,
      },
    };
    return c.json(response, 400);
  }

  // Handle standard errors
  if (error instanceof Error) {
    const response: ErrorResponse = {
      error: {
        type: "internal_error",
        message: error.message,
        statusCode: 500,
      },
    };
    return c.json(response, 500);
  }

  // Handle unknown errors
  const response: ErrorResponse = {
    error: {
      type: "unknown_error",
      message: "An unexpected error occurred",
      statusCode: 500,
    },
  };
  return c.json(response, 500);
}

/**
 * Create error handler middleware for Hono
 */
export function errorHandler() {
  return async (c: Context, next: () => Promise<void>) => {
    try {
      await next();
    } catch (error) {
      return handleError(error, c);
    }
  };
}

/**
 * Not found handler
 */
export function notFoundHandler(c: Context): Response {
  return c.json(
    {
      error: {
        type: "not_found",
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        statusCode: 404,
      },
    },
    404
  );
}
