/**
 * CLI Apify Client
 * ================
 * Wrapper around the Apify REST API for CLI usage.
 */

const APIFY_BASE_URL = "https://api.apify.com/v2";

export class ApifyCliClient {
  private token: string;

  constructor() {
    this.token = process.env.APIFY_API_TOKEN || "";
    if (!this.token) {
      throw new Error(
        "APIFY_API_TOKEN environment variable is not set.\n" +
          "Get your token from: https://console.apify.com/account/integrations"
      );
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${APIFY_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error (${response.status}): ${error}`);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && !contentType.includes("application/json")) {
      return (await response.text()) as unknown as T;
    }

    return response.json();
  }

  // User
  async getUser(): Promise<{ data: any }> {
    return this.request("/users/me");
  }

  // Actors
  async getActor(actorId: string): Promise<{ data: any }> {
    return this.request(`/acts/${encodeURIComponent(actorId)}`);
  }

  async runActor(
    actorId: string,
    input: Record<string, unknown>
  ): Promise<{ data: any }> {
    return this.request(`/acts/${encodeURIComponent(actorId)}/runs`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async getRun(runId: string): Promise<{ data: any }> {
    return this.request(`/actor-runs/${runId}`);
  }

  async getRunLog(runId: string): Promise<string> {
    return this.request(`/actor-runs/${runId}/log`);
  }

  async listRuns(options: {
    limit?: number;
    status?: string;
  } = {}): Promise<{ data: any }> {
    const params = new URLSearchParams();
    if (options.limit) params.set("limit", options.limit.toString());
    if (options.status) params.set("status", options.status);
    const query = params.toString();
    return this.request(`/actor-runs${query ? `?${query}` : ""}`);
  }

  async abortRun(runId: string): Promise<{ data: any }> {
    return this.request(`/actor-runs/${runId}/abort`, { method: "POST" });
  }

  // Datasets
  async listDatasets(limit = 20): Promise<{ data: any }> {
    return this.request(`/datasets?limit=${limit}`);
  }

  async getDataset(datasetId: string): Promise<{ data: any }> {
    return this.request(`/datasets/${datasetId}`);
  }

  async getDatasetItems(
    datasetId: string,
    limit = 50
  ): Promise<any[]> {
    const response = await this.request<any>(
      `/datasets/${datasetId}/items?limit=${limit}&clean=true`
    );
    // Items are returned directly, not wrapped in data
    return Array.isArray(response) ? response : response.items || [];
  }

  async deleteDataset(datasetId: string): Promise<void> {
    await this.request(`/datasets/${datasetId}`, { method: "DELETE" });
  }

  // Key-Value Stores
  async listKeyValueStores(limit = 20): Promise<{ data: any }> {
    return this.request(`/key-value-stores?limit=${limit}`);
  }

  async getKeyValueRecord(storeId: string, key: string): Promise<any> {
    return this.request(
      `/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`
    );
  }

  async setKeyValueRecord(
    storeId: string,
    key: string,
    value: unknown
  ): Promise<void> {
    await this.request(
      `/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`,
      {
        method: "PUT",
        body: JSON.stringify(value),
      }
    );
  }

  async deleteKeyValueRecord(storeId: string, key: string): Promise<void> {
    await this.request(
      `/key-value-stores/${storeId}/records/${encodeURIComponent(key)}`,
      { method: "DELETE" }
    );
  }
}

// Singleton instance
let client: ApifyCliClient | null = null;

export function getClient(): ApifyCliClient {
  if (!client) {
    client = new ApifyCliClient();
  }
  return client;
}
