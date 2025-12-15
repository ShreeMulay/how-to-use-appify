/**
 * Apify API Type Definitions
 * ==========================
 * TypeScript interfaces for Apify API entities and responses.
 */

// ============================================================================
// Actor Types
// ============================================================================

export interface Actor {
  id: string;
  name: string;
  username: string;
  title: string;
  description: string;
  stats: ActorStats;
  versions?: ActorVersion[];
  defaultRunOptions?: ActorRunOptions;
  isPublic: boolean;
  createdAt: string;
  modifiedAt: string;
}

export interface ActorStats {
  totalBuilds: number;
  totalRuns: number;
  totalUsers: number;
  totalUsers30Days?: number;
  lastRunStartedAt?: string;
}

export interface ActorVersion {
  versionNumber: string;
  buildTag: string;
  sourceType: string;
  envVars?: Record<string, string>;
}

export interface ActorRunOptions {
  build?: string;
  timeoutSecs?: number;
  memoryMbytes?: number;
}

export interface ActorInputSchema {
  title: string;
  type: string;
  schemaVersion: number;
  properties: Record<string, ActorInputProperty>;
  required?: string[];
}

export interface ActorInputProperty {
  title: string;
  type: string;
  description?: string;
  default?: unknown;
  editor?: string;
  prefill?: unknown;
  example?: unknown;
  enum?: unknown[];
  items?: ActorInputProperty;
  properties?: Record<string, ActorInputProperty>;
}

// ============================================================================
// Popular Actor Types (Curated List)
// ============================================================================

export type ActorCategory =
  | "ai-llm"
  | "social-media"
  | "business-data"
  | "ecommerce"
  | "developer-tools";

export type ActorDifficulty = "beginner" | "intermediate" | "advanced";

export type ActorCost = "low" | "medium" | "high";

export interface PopularActor {
  id: string;
  name: string;
  description: string;
  category: ActorCategory;
  difficulty: ActorDifficulty;
  estimatedCost: ActorCost;
  documentationUrl: string;
  exampleInput?: Record<string, unknown>;
}

// ============================================================================
// Run Types
// ============================================================================

export type RunStatus =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "ABORTING"
  | "ABORTED"
  | "TIMING-OUT"
  | "TIMED-OUT";

export interface ActorRun {
  id: string;
  actId: string;
  actorTaskId?: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  buildId: string;
  buildNumber: string;
  exitCode?: number;
  defaultKeyValueStoreId: string;
  defaultDatasetId: string;
  defaultRequestQueueId: string;
  containerUrl?: string;
  stats: RunStats;
  options: RunOptions;
  usage?: RunUsage;
}

export interface RunStats {
  inputBodyLen: number;
  restartCount: number;
  resurrectCount: number;
  durationMillis?: number;
  runTimeSecs?: number;
  computeUnits?: number;
}

export interface RunOptions {
  build: string;
  timeoutSecs: number;
  memoryMbytes: number;
}

export interface RunUsage {
  ACTOR_COMPUTE_UNITS?: number;
  DATASET_READS?: number;
  DATASET_WRITES?: number;
  KEY_VALUE_STORE_READS?: number;
  KEY_VALUE_STORE_WRITES?: number;
  KEY_VALUE_STORE_LISTS?: number;
  REQUEST_QUEUE_READS?: number;
  REQUEST_QUEUE_WRITES?: number;
  DATA_TRANSFER_INTERNAL_GBYTES?: number;
  DATA_TRANSFER_EXTERNAL_GBYTES?: number;
  PROXY_RESIDENTIAL_TRANSFER_GBYTES?: number;
  PROXY_SERPS?: number;
}

export interface RunLog {
  log: string;
}

// ============================================================================
// Dataset Types
// ============================================================================

export interface Dataset {
  id: string;
  name?: string;
  userId: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  itemCount: number;
  cleanItemCount: number;
  actId?: string;
  actRunId?: string;
}

export interface DatasetItem {
  [key: string]: unknown;
}

export interface DatasetItemsResponse {
  items: DatasetItem[];
  total: number;
  offset: number;
  count: number;
  limit: number;
  desc: boolean;
}

// ============================================================================
// Key-Value Store Types
// ============================================================================

export interface KeyValueStore {
  id: string;
  name?: string;
  userId: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  actId?: string;
  actRunId?: string;
}

export interface KeyValueRecord {
  key: string;
  size: number;
}

export interface KeyValueRecordInfo {
  key: string;
  value: unknown;
  contentType: string;
}

export interface KeyValueListResponse {
  items: KeyValueRecord[];
  count: number;
  limit: number;
  isTruncated: boolean;
  exclusiveStartKey?: string;
  nextExclusiveStartKey?: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface ApifyUser {
  id: string;
  username: string;
  email: string;
  profile: UserProfile;
  plan: UserPlan;
}

export interface UserProfile {
  name?: string;
  bio?: string;
  pictureUrl?: string;
}

export interface UserPlan {
  id: string;
  description: string;
  isEnabled: boolean;
  monthlyBasePriceUsd: number;
  monthlyUsageCreditsUsd: number;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApifyApiResponse<T> {
  data: T;
}

export interface ApifyApiError {
  error: {
    type: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  count: number;
  limit: number;
  desc: boolean;
}

// ============================================================================
// API Request Types
// ============================================================================

export interface RunActorInput {
  input?: Record<string, unknown>;
  options?: {
    build?: string;
    memory?: number;
    timeout?: number;
    waitForFinish?: number;
  };
}

export interface DatasetPushInput {
  items: DatasetItem[];
}

export interface KeyValueSetInput {
  value: unknown;
  contentType?: string;
}
