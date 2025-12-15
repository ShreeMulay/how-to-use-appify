export interface Actor {
  id: string
  name: string
  username: string
  title: string
  description: string
  stats: ActorStats
  isPublic: boolean
  createdAt: string
  modifiedAt: string
  curated?: CuratedActorMetadata
}

export interface ActorStats {
  totalBuilds: number
  totalRuns: number
  totalUsers: number
  lastRunStartedAt?: string
}

export interface CuratedActorMetadata {
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedCost: "low" | "medium" | "high"
  exampleInput?: Record<string, unknown>
}

export interface PopularActor {
  id: string
  name: string
  description: string
  category: string
  difficulty: string
  estimatedCost: string
  documentationUrl: string
}

export interface ActorRun {
  id: string
  actId: string
  status: RunStatus
  startedAt: string
  finishedAt?: string
  defaultDatasetId: string
  defaultKeyValueStoreId: string
  stats: RunStats
}

export type RunStatus =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "ABORTING"
  | "ABORTED"
  | "TIMING-OUT"
  | "TIMED-OUT"

export interface RunStats {
  durationMillis?: number
  resurrectCount: number
  computeUnits?: number
}

export interface Dataset {
  id: string
  name?: string
  itemCount: number
  cleanItemCount: number
  createdAt: string
  modifiedAt: string
}

export interface KeyValueStore {
  id: string
  name?: string
  createdAt: string
  modifiedAt: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    total: number
    offset: number
    limit: number
  }
}
