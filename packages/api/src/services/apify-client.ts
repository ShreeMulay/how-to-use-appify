/**
 * Apify Client Service
 * ====================
 * A wrapper around the Apify REST API for use in the backend.
 */

import type {
  Actor,
  ActorInputSchema,
  ActorRun,
  ApifyApiResponse,
  ApifyUser,
  Dataset,
  DatasetItem,
  DatasetItemsResponse,
  KeyValueListResponse,
  KeyValueRecordInfo,
  KeyValueStore,
  PaginatedResponse,
  RunActorInput,
  RunLog,
} from "../types/apify";

const APIFY_BASE_URL = "https://api.apify.com/v2";

/**
 * Apify API Client
 */
export class ApifyClient {
  private token: string;
  private baseUrl: string;

  constructor(token?: string) {
    this.token = token || process.env.APIFY_API_TOKEN || "";
    this.baseUrl = APIFY_BASE_URL;

    if (!this.token) {
      console.warn("Warning: APIFY_API_TOKEN not set. API calls will fail.");
    }
  }

  /**
   * Make an authenticated request to the Apify API
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage: string;
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.error?.message || errorBody;
      } catch {
        errorMessage = errorBody;
      }
      throw new ApifyError(
        `Apify API error: ${response.status} - ${errorMessage}`,
        response.status,
        errorMessage
      );
    }

    // Handle non-JSON responses (like logs)
    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return (await response.text()) as unknown as T;
    }

    return response.json();
  }

  // ===========================================================================
  // User Methods
  // ===========================================================================

  /**
   * Get current user info
   */
  async getUser(): Promise<ApifyUser> {
    const response = await this.request<ApifyApiResponse<ApifyUser>>("/users/me");
    return response.data;
  }

  // ===========================================================================
  // Actor Methods
  // ===========================================================================

  /**
   * Get actor details by ID
   */
  async getActor(actorId: string): Promise<Actor> {
    const response = await this.request<ApifyApiResponse<Actor>>(
      `/acts/${encodeURIComponent(actorId)}`
    );
    return response.data;
  }

  /**
   * Get actor input schema
   */
  async getActorInputSchema(actorId: string): Promise<ActorInputSchema | null> {
    try {
      // Get the latest version's input schema from the actor's default key-value store
      const actor = await this.getActor(actorId);
      
      // Try to get the INPUT_SCHEMA from the actor's builds
      const builds = await this.request<ApifyApiResponse<PaginatedResponse<{ id: string }>>>(
        `/acts/${encodeURIComponent(actorId)}/builds?limit=1&desc=true`
      );

      if (builds.data.items.length === 0) {
        return null;
      }

      const buildId = builds.data.items[0].id;
      
      // Get the build's key-value store
      const build = await this.request<ApifyApiResponse<{ defaultKeyValueStoreId: string }>>(
        `/actor-builds/${buildId}`
      );

      // Try to get INPUT_SCHEMA from the build's store
      try {
        const schema = await this.request<ActorInputSchema>(
          `/key-value-stores/${build.data.defaultKeyValueStoreId}/records/INPUT_SCHEMA`
        );
        return schema;
      } catch {
        // INPUT_SCHEMA might not exist
        return null;
      }
    } catch (error) {
      console.error("Failed to get actor input schema:", error);
      return null;
    }
  }

  /**
   * Run an actor
   */
  async runActor(actorId: string, input: RunActorInput = {}): Promise<ActorRun> {
    const queryParams = new URLSearchParams();
    
    if (input.options?.build) {
      queryParams.set("build", input.options.build);
    }
    if (input.options?.memory) {
      queryParams.set("memory", input.options.memory.toString());
    }
    if (input.options?.timeout) {
      queryParams.set("timeout", input.options.timeout.toString());
    }
    if (input.options?.waitForFinish !== undefined) {
      queryParams.set("waitForFinish", input.options.waitForFinish.toString());
    }

    const queryString = queryParams.toString();
    const url = `/acts/${encodeURIComponent(actorId)}/runs${queryString ? `?${queryString}` : ""}`;

    const response = await this.request<ApifyApiResponse<ActorRun>>(url, {
      method: "POST",
      body: JSON.stringify(input.input || {}),
    });

    return response.data;
  }

  /**
   * Get actor run by ID
   */
  async getRun(runId: string): Promise<ActorRun> {
    const response = await this.request<ApifyApiResponse<ActorRun>>(
      `/actor-runs/${runId}`
    );
    return response.data;
  }

  /**
   * Get actor run log
   */
  async getRunLog(runId: string): Promise<string> {
    const log = await this.request<string>(`/actor-runs/${runId}/log`);
    return log;
  }

  /**
   * Abort an actor run
   */
  async abortRun(runId: string): Promise<ActorRun> {
    const response = await this.request<ApifyApiResponse<ActorRun>>(
      `/actor-runs/${runId}/abort`,
      { method: "POST" }
    );
    return response.data;
  }

  /**
   * Resurrect an actor run
   */
  async resurrectRun(runId: string): Promise<ActorRun> {
    const response = await this.request<ApifyApiResponse<ActorRun>>(
      `/actor-runs/${runId}/resurrect`,
      { method: "POST" }
    );
    return response.data;
  }

  /**
   * List actor runs
   */
  async listRuns(options: {
    limit?: number;
    offset?: number;
    status?: string;
    actorId?: string;
  } = {}): Promise<PaginatedResponse<ActorRun>> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.set("limit", options.limit.toString());
    if (options.offset) queryParams.set("offset", options.offset.toString());
    if (options.status) queryParams.set("status", options.status);

    const queryString = queryParams.toString();
    
    // If actorId provided, use actor-specific endpoint
    const endpoint = options.actorId
      ? `/acts/${encodeURIComponent(options.actorId)}/runs`
      : "/actor-runs";

    const response = await this.request<ApifyApiResponse<PaginatedResponse<ActorRun>>>(
      `${endpoint}${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
  }

  // ===========================================================================
  // Dataset Methods
  // ===========================================================================

  /**
   * List datasets
   */
  async listDatasets(options: {
    limit?: number;
    offset?: number;
    unnamed?: boolean;
  } = {}): Promise<PaginatedResponse<Dataset>> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.set("limit", options.limit.toString());
    if (options.offset) queryParams.set("offset", options.offset.toString());
    if (options.unnamed !== undefined) queryParams.set("unnamed", options.unnamed.toString());

    const queryString = queryParams.toString();

    const response = await this.request<ApifyApiResponse<PaginatedResponse<Dataset>>>(
      `/datasets${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
  }

  /**
   * Get dataset by ID
   */
  async getDataset(datasetId: string): Promise<Dataset> {
    const response = await this.request<ApifyApiResponse<Dataset>>(
      `/datasets/${datasetId}`
    );
    return response.data;
  }

  /**
   * Get dataset items
   */
  async getDatasetItems(
    datasetId: string,
    options: {
      limit?: number;
      offset?: number;
      clean?: boolean;
      desc?: boolean;
      fields?: string[];
    } = {}
  ): Promise<DatasetItemsResponse> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.set("limit", options.limit.toString());
    if (options.offset) queryParams.set("offset", options.offset.toString());
    if (options.clean !== undefined) queryParams.set("clean", options.clean.toString());
    if (options.desc !== undefined) queryParams.set("desc", options.desc.toString());
    if (options.fields) queryParams.set("fields", options.fields.join(","));

    const queryString = queryParams.toString();

    const response = await this.request<DatasetItemsResponse>(
      `/datasets/${datasetId}/items${queryString ? `?${queryString}` : ""}`
    );

    return response;
  }

  /**
   * Push items to dataset
   */
  async pushDatasetItems(
    datasetId: string,
    items: DatasetItem[]
  ): Promise<void> {
    await this.request(`/datasets/${datasetId}/items`, {
      method: "POST",
      body: JSON.stringify(items),
    });
  }

  /**
   * Delete dataset
   */
  async deleteDataset(datasetId: string): Promise<void> {
    await this.request(`/datasets/${datasetId}`, {
      method: "DELETE",
    });
  }

  // ===========================================================================
  // Key-Value Store Methods
  // ===========================================================================

  /**
   * List key-value stores
   */
  async listKeyValueStores(options: {
    limit?: number;
    offset?: number;
    unnamed?: boolean;
  } = {}): Promise<PaginatedResponse<KeyValueStore>> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.set("limit", options.limit.toString());
    if (options.offset) queryParams.set("offset", options.offset.toString());
    if (options.unnamed !== undefined) queryParams.set("unnamed", options.unnamed.toString());

    const queryString = queryParams.toString();

    const response = await this.request<ApifyApiResponse<PaginatedResponse<KeyValueStore>>>(
      `/key-value-stores${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
  }

  /**
   * Get key-value store by ID
   */
  async getKeyValueStore(storeId: string): Promise<KeyValueStore> {
    const response = await this.request<ApifyApiResponse<KeyValueStore>>(
      `/key-value-stores/${storeId}`
    );
    return response.data;
  }

  /**
   * List records in a key-value store
   */
  async listKeyValueRecords(
    storeId: string,
    options: {
      limit?: number;
      exclusiveStartKey?: string;
    } = {}
  ): Promise<KeyValueListResponse> {
    const queryParams = new URLSearchParams();
    
    if (options.limit) queryParams.set("limit", options.limit.toString());
    if (options.exclusiveStartKey) queryParams.set("exclusiveStartKey", options.exclusiveStartKey);

    const queryString = queryParams.toString();

    const response = await this.request<ApifyApiResponse<KeyValueListResponse>>(
      `/key-value-stores/${storeId}/keys${queryString ? `?${queryString}` : ""}`
    );

    return response.data;
  }

  /**
   * Get a record from key-value store
   */
  async getKeyValueRecord(storeId: string, key: string): Promise<unknown> {
    const response = await this.request<unknown>(
      `/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`
    );
    return response;
  }

  /**
   * Set a record in key-value store
   */
  async setKeyValueRecord(
    storeId: string,
    key: string,
    value: unknown,
    contentType = "application/json"
  ): Promise<void> {
    const body = contentType === "application/json" 
      ? JSON.stringify(value)
      : value;

    await this.request(`/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: body as string,
    });
  }

  /**
   * Delete a record from key-value store
   */
  async deleteKeyValueRecord(storeId: string, key: string): Promise<void> {
    await this.request(
      `/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  }

  /**
   * Delete key-value store
   */
  async deleteKeyValueStore(storeId: string): Promise<void> {
    await this.request(`/key-value-stores/${storeId}`, {
      method: "DELETE",
    });
  }
}

/**
 * Custom error class for Apify API errors
 */
export class ApifyError extends Error {
  statusCode: number;
  apiMessage: string;

  constructor(message: string, statusCode: number, apiMessage: string) {
    super(message);
    this.name = "ApifyError";
    this.statusCode = statusCode;
    this.apiMessage = apiMessage;
  }
}

/**
 * Singleton instance of the Apify client
 */
let clientInstance: ApifyClient | null = null;

/**
 * Get the singleton Apify client instance
 */
export function getApifyClient(): ApifyClient {
  if (!clientInstance) {
    clientInstance = new ApifyClient();
  }
  return clientInstance;
}
