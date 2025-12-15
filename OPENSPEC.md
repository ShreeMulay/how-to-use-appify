# OpenSpec: Apify Learning Lab

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Apify Learning Lab |
| **Repository** | `how-to-use-appify` |
| **Version** | 1.0.1 |
| **Created** | 2024-12-14 |
| **Last Updated** | 2024-12-14 |
| **Status** | In Development |

---

## 1. Executive Summary

### 1.1 Purpose

Apify Learning Lab is a comprehensive learning environment for developers to explore and master the Apify.com platform. It provides three complementary approaches to learning:

1. **Interactive Web Dashboard** - A full-stack web application for exploring actors, running scraping jobs, and managing data
2. **Python Sample Scripts** - Standalone, well-documented scripts demonstrating various Apify features  
3. **CLI Playground** - A command-line tool for quick interactions with the Apify API

### 1.2 Goals

- Enable rapid learning of Apify's core concepts (Actors, Datasets, Key-Value Stores, Runs)
- Provide working code examples for common use cases (web scraping, social media, business data, AI/LLM)
- Create a reference implementation of Apify API integration patterns
- Demonstrate best practices for building applications with Apify

### 1.3 Target Audience

- Developers new to Apify who want hands-on learning
- Teams evaluating Apify for their data extraction needs
- Developers building applications that integrate with Apify

---

## 2. Technical Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Bun | 1.3.3+ | JavaScript/TypeScript runtime |
| Backend | Hono | 4.6.x | Lightweight web framework |
| Frontend | React | 19.x | UI library |
| UI Components | shadcn/ui | v4 | Pre-built accessible components |
| Styling | Tailwind CSS | 3.4.x | Utility-first CSS |
| Python | System Python | 3.12.8 | Sample scripts |
| Validation | Zod | 3.23.x | Runtime type validation |

### 2.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   Web Browser   │  │  CLI Terminal   │  │   Python    │ │
│  │  (React SPA)    │  │  (Commander)    │  │  Scripts    │ │
│  └────────┬────────┘  └────────┬────────┘  └──────┬──────┘ │
│           │                    │                   │        │
└───────────┼────────────────────┼───────────────────┼────────┘
            │                    │                   │
            ▼                    ▼                   │ 
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Hono API Server (:3001)                 │   │
│  │  ┌─────────┐ ┌─────────┐           ┌─────────┐      │   │
│  │  │ /actors │ │/datasets│           │  /runs  │      │   │
│  │  └─────────┘ └─────────┘           └─────────┘      │   │
│  │                                                      │   │
│  │  ┌────────────────────────────────────────────┐     │   │
│  │  │           Apify Client Service              │     │   │
│  │  │  (Wraps all Apify REST API interactions)   │     │   │
│  │  └────────────────────────────────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
            │                                    │
            ▼                                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Apify REST API (v2)                     │   │
│  │              https://api.apify.com/v2                │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Note**: `/api/storage` routes are not currently implemented in the backend. The frontend has storage UI components, but they will fail with 404 errors until storage routes are added.

### 2.3 Project Structure

```
how-to-use-appify/
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── package.json                      # Bun workspace configuration
├── README.md                         # Project documentation
├── OPENSPEC.md                       # This specification document
│
├── packages/
│   ├── api/                          # Backend API Server
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts              # Hono app entry point
│   │       ├── routes/
│   │       │   ├── actors.ts         # Actor-related endpoints
│   │       │   ├── datasets.ts       # Dataset endpoints
│   │       │   ├── runs.ts           # Run management endpoints
│   │       │   └── health.ts         # Health check endpoints
│   │       │   └── storage.ts        # NOT IMPLEMENTED
│   │       ├── services/
│   │       │   └── apify-client.ts   # Apify API wrapper
│   │       ├── middleware/
│   │       │   ├── error-handler.ts  # Global error handling
│   │       │   └── logger.ts         # Request logging
│   │       ├── data/
│   │       │   └── popular-actors.ts # Curated actor metadata
│   │       └── types/
│   │           └── apify.ts          # TypeScript type definitions
│   │
│   └── web/                          # Frontend React Application
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── components.json           # shadcn/ui configuration
│       ├── index.html
│       └── src/
│           ├── main.tsx              # React entry point
│           ├── App.tsx               # Root component with routing
│           ├── components/
│           │   ├── ui/               # shadcn/ui components
│           │   ├── layout/           # Layout components
│           │   └── actors/           # Actor-related components
│           ├── hooks/                # Custom React hooks
│           ├── lib/                  # Utility functions
│           │   └── api-client.ts     # API client wrapper
│           ├── pages/                # Page components
│           └── types/                # TypeScript types
│
├── python-samples/                   # Python Learning Scripts
│   ├── requirements.txt
│   ├── README.md
│   └── *.py                          # Individual sample scripts
│
└── cli/                              # CLI Playground
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── index.ts                  # CLI entry point
        └── lib/
            └── client.ts             # CLI Apify client wrapper
```

---

## 3. API Specification

### 3.1 Base Configuration

| Property | Value |
|----------|-------|
| Base URL | `http://localhost:3001/api` |
| Content-Type | `application/json` |
| Authentication | Server-side (API token in .env) |

### 3.2 Actors Endpoints

#### GET /api/actors/popular

Returns curated list of learning-friendly actors.

**Query Parameters:**
- `category` (string) - Filter by category
- `difficulty` (string) - Filter by difficulty
- `search` (string) - Search actors (Note: frontend handles this client-side)

**Response:**
```json
{
  "data": [
    {
      "id": "apify/website-content-crawler",
      "name": "Website Content Crawler",
      "description": "Crawl websites for AI/LLM data",
      "category": "ai-llm",
      "difficulty": "beginner",
      "estimatedCost": "low",
      "documentationUrl": "https://apify.com/apify/website-content-crawler",
      "exampleInput": {...}
    }
  ],
  "meta": {
    "total": 20,
    "categories": ["ai-llm", "social-media", "business-data", "ecommerce", "developer-tools"]
  }
}
```

#### GET /api/actors/categories

Returns available actor categories.

**Response:**
```json
{
  "data": [
    {
      "id": "ai-llm",
      "name": "Ai Llm",
      "count": 3
    }
  ]
}
```

#### GET /api/actors/:actorId

Returns detailed actor information from Apify API, including curated metadata.

**Response:**
```json
{
  "data": {
    "id": "aYG0l9s7dbB7j3gbS",
    "name": "website-content-crawler",
    "username": "apify",
    "title": "Website Content Crawler",
    "description": "...",
    "stats": {
      "totalBuilds": 100,
      "totalRuns": 50000,
      "totalUsers": 10000
    },
    "curated": {
      "category": "ai-llm",
      "difficulty": "beginner",
      "estimatedCost": "low",
      "exampleInput": {...}
    }
  }
}
```

#### GET /api/actors/:actorId/input-schema

Returns the input schema for an actor. Falls back to example input from curated list if schema not available.

**Response:**
```json
{
  "data": {
    "title": "Website Content Crawler Input",
    "type": "object", 
    "schemaVersion": 1,
    "properties": {
      "startUrls": {
        "title": "Start URLs",
        "type": "array",
        "description": "URLs to start crawling from",
        "editor": "requestListSources"
      },
      "maxCrawlPages": {
        "title": "Max pages",
        "type": "integer",
        "default": 100
      }
    },
    "required": ["startUrls"]
  }
}
```

#### POST /api/actors/:actorId/run

Starts an actor run with the provided input.

**Request Body:**
```json
{
  "input": {
    "startUrls": [{"url": "https://example.com"}],
    "maxCrawlPages": 10
  },
  "options": {
    "memory": 1024,
    "timeout": 300,
    "waitForFinish": 0
  }
}
```

**Response:**
```json
{
  "data": {
    "id": "run123abc",
    "actId": "aYG0l9s7dbB7j3gbS",
    "status": "RUNNING",
    "startedAt": "2024-12-14T10:00:00.000Z",
    "defaultDatasetId": "dataset123",
    "defaultKeyValueStoreId": "kvs123"
  }
}
```

#### GET /api/actors/:actorId/runs/:runId

Returns run status and details.

**Response:**
```json
{
  "data": {
    "id": "run123abc",
    "actId": "aYG0l9s7dbB7j3gbS",
    "status": "SUCCEEDED",
    "startedAt": "2024-12-14T10:00:00.000Z",
    "finishedAt": "2024-12-14T10:05:00.000Z",
    "stats": {
      "inputBodyLen": 100,
      "durationMillis": 300000,
      "resurrectCount": 0
    },
    "defaultDatasetId": "dataset123",
    "defaultKeyValueStoreId": "kvs123"
  }
}
```

#### GET /api/actors/:actorId/runs/:runId/log

Returns the run log.

**Response:**
```json
{
  "data": {
    "log": "2024-12-14T10:00:00.000Z INFO Starting crawl...\n..."
  }
}
```

#### POST /api/actors/:actorId/runs/:runId/abort

Aborts a running actor.

**Response:**
```json
{
  "data": {
    "id": "run123abc",
    "status": "ABORTING"
  }
}
```

### 3.3 Datasets Endpoints

#### GET /api/datasets

Lists all datasets for the authenticated user.

**Query Parameters:**
- `limit` (number) - Max results (default: 20)
- `offset` (number) - Pagination offset (default: 0)
- `unnamed` (boolean) - Include unnamed datasets

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "dataset123",
        "name": "my-dataset",
        "itemCount": 1500,
        "createdAt": "2024-12-14T10:00:00.000Z"
      }
    ],
    "total": 50,
    "offset": 0,
    "limit": 20
  }
}
```

#### GET /api/datasets/:datasetId

Returns dataset metadata.

**Response:**
```json
{
  "data": {
    "id": "dataset123",
    "name": "my-dataset",
    "itemCount": 1500,
    "cleanItemCount": 1450,
    "createdAt": "2024-12-14T10:00:00.000Z",
    "modifiedAt": "2024-12-14T10:05:00.000Z"
  }
}
```

#### GET /api/datasets/:datasetId/items

Returns dataset items with pagination.

**Query Parameters:**
- `limit` (number) - Max items (default: 50, max: 1000, enforced by backend)
- `offset` (number) - Pagination offset (default: 0)
- `clean` (boolean) - Exclude metadata fields (default: true)
- `desc` (boolean) - Descending order (default: false)
- `fields` (string) - Comma-separated field list

**Response:**
```json
{
  "data": {
    "items": [
      {
        "url": "https://example.com/page1",
        "title": "Example Page",
        "text": "Page content..."
      }
    ],
    "total": 1500,
    "count": 50,
    "offset": 0,
    "limit": 50
  }
}
```

#### POST /api/datasets/:datasetId/items

Pushes items to a dataset.

**Request Body:**
```json
{
  "items": [
    {"url": "https://example.com", "title": "Example"}
  ]
}
```

**Response:**
```json
{
  "data": {
    "success": true,
    "itemsAdded": 1
  }
}
```

#### GET /api/datasets/:datasetId/download

Downloads all dataset items as CSV or JSON. **Note:** Currently pulls up to 10,000 items into memory for conversion.

**Query Parameters:**
- `format` (string) - `json` or `csv` (default: `json`)

**Response:** Binary download stream with appropriate Content-Type and Content-Disposition headers.

#### DELETE /api/datasets/:datasetId

Deletes a dataset.

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

### 3.4 Storage Endpoints (Key-Value Stores)

**Status: NOT IMPLEMENTED**

The following endpoints are specified in the OpenSpec but do not exist in the current implementation:

- `GET /api/storage` - List key-value stores
- `GET /api/storage/:storeId/records` - List record keys
- `GET /api/storage/:storeId/records/:key` - Get record value
- `PUT /api/storage/:storeId/records/:key` - Set record value
- `DELETE /api/storage/:storeId/records/:key` - Delete record

**Frontend Impact:** The `/storage` page in the web app will display an error or empty state until these routes are implemented.

### 3.5 Runs Endpoints

#### GET /api/runs

Lists recent actor runs.

**Query Parameters:**
- `limit` (number) - Max results (default: 20, max: 100)
- `offset` (number) - Pagination offset (default: 0)
- `status` (string) - Filter by status: `READY`, `RUNNING`, `SUCCEEDED`, `FAILED`, `ABORTED`, `TIMED_OUT`
- `actorId` (string) - Filter by actor ID

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "run123",
        "actId": "aYG0l9s7dbB7j3gbS",
        "status": "SUCCEEDED",
        "startedAt": "2024-12-14T10:00:00.000Z",
        "finishedAt": "2024-12-14T10:05:00.000Z",
        "stats": {
          "durationMillis": 300000,
          "resurrectCount": 0
        }
      }
    ],
    "total": 100,
    "offset": 0,
    "limit": 20
  }
}
```

#### GET /api/runs/:runId

Returns detailed run information.

**Response:** Same as individual item from `/api/runs` list.

#### GET /api/runs/:runId/log

Returns run log content.

**Response:**
```json
{
  "data": {
    "log": "2024-12-14T10:00:00.000Z INFO Starting crawl...\n..."
  }
}
```

#### POST /api/runs/:runId/abort

Aborts a running actor.

**Response:**
```json
{
  "data": {
    "id": "run123abc",
    "status": "ABORTING"
  }
}
```

#### POST /api/runs/:runId/resurrect

Resurrects a finished run.

**Response:** Resurrected run object.

### 3.6 Health Endpoints

#### GET /api/health

Server health check.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-14T10:00:00.000Z",
  "version": "1.0.0",
  "environment": "development"
}
```

#### GET /api/health/apify

Apify API connectivity check.

**Response:**
```json
{
  "status": "ok",
  "apifyConnected": true,
  "user": {
    "username": "myuser",
    "email": "user@example.com",
    "plan": "FREE"
  }
}
```

---

## 4. Data Models

### 4.1 TypeScript Types

```typescript
// Actor Types
interface Actor {
  id: string;
  name: string;
  username: string;
  title: string;
  description: string;
  stats: ActorStats;
  versions: ActorVersion[];
  isPublic: boolean;
  createdAt: string;
  modifiedAt: string;
  curated?: CuratedActorMetadata;
}

interface ActorStats {
  totalBuilds: number;
  totalRuns: number;
  totalUsers: number;
  totalUsers30Days?: number;
  lastRunStartedAt?: string;
}

interface ActorVersion {
  versionNumber: string;
  buildTag: string;
  sourceType: string;
  envVars?: Record<string, string>;
}

interface CuratedActorMetadata {
  category: ActorCategory;
  difficulty: ActorDifficulty;
  estimatedCost: ActorCost;
  exampleInput?: Record<string, unknown>;
}

type ActorCategory = "ai-llm" | "social-media" | "business-data" | "ecommerce" | "developer-tools";
type ActorDifficulty = "beginner" | "intermediate" | "advanced";
type ActorCost = "low" | "medium" | "high";

// Run Types
interface ActorRun {
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

type RunStatus = "READY" | "RUNNING" | "SUCCEEDED" | "FAILED" | "ABORTING" | "ABORTED" | "TIMING-OUT" | "TIMED-OUT";

interface RunStats {
  inputBodyLen: number;
  restartCount: number;
  resurrectCount: number;
  durationMillis?: number;
  runTimeSecs?: number;
  computeUnits?: number;
}

interface RunOptions {
  build: string;
  timeoutSecs: number;
  memoryMbytes: number;
}

// Dataset Types
interface Dataset {
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

interface DatasetItem {
  [key: string]: unknown;
}

// Key-Value Store Types
interface KeyValueStore {
  id: string;
  name?: string;
  userId: string;
  createdAt: string;
  modifiedAt: string;
  accessedAt: string;
  actId?: string;
  actRunId?: string;
}

interface KeyValueRecordInfo {
  key: string;
  value: unknown;
  contentType: string;
  size?: number;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    offset: number;
    limit: number;
  };
  error?: never;
}

interface ApiError {
  data?: never;
  error: {
    type: string;
    message: string;
    statusCode?: number;
  };
}

type ApiResult<T> = ApiResponse<T> | ApiError;
```

---

## 5. Frontend Specification

### 5.1 Pages and Routes

| Route | Component | Description | Implementation Status |
|-------|-----------|-------------|----------------------|
| `/` | `Dashboard` | Overview with stats and recent activity | ✅ Implemented |
| `/actors` | `ActorExplorer` | Browse curated actors | ✅ Implemented |
| `/actors/:id` | `ActorRunner` | Actor run interface with config and logs | ✅ Implemented |
| `/datasets` | `Datasets` | Browse all datasets | ✅ Implemented |
| `/datasets/:id` | `DatasetViewer` | View dataset items | ✅ Implemented |
| `/storage` | `Storage` | Browse key-value stores | ⚠️ UI exists, API missing |
| `/runs` | `Runs` | List all runs | ✅ Implemented |
| `/runs/:id` | `RunDetail` | Run details and logs | ❌ Not implemented |

### 5.2 Component Hierarchy

```
App
├── AppLayout
│   ├── AppSidebar
│   │   └── SidebarMenu
│   └── AppHeader
│       └── Breadcrumb
│
├── Dashboard
│   ├── StatsCards
│   ├── RecentRuns
│   └── QuickActions
│
├── ActorExplorer
│   ├── SearchInput
│   ├── CategoryFilter
│   └── ActorGrid
│       └── ActorCard
│
├── ActorRunner
│   ├── RunConfiguration
│   └── RunOutput
│
├── Datasets
│   └── DatasetTable
│
├── DatasetViewer
│   ├── DatasetInfo
│   └── DataTable
│
├── Storage
│   └── StoreTable (⚠️ No API)
│
└── Runs
    └── RunTable
```

### 5.3 API Client Implementation

The web frontend uses `packages/web/src/lib/api-client.ts` which has known inconsistencies:

- **Mixed Response Handling**: Some endpoints return full `{data, meta}` objects while others use `fetcher()` that extracts only `data`
- **Hardcoded URLs**: Download links use `http://localhost:3001` instead of relative paths, breaking proxy behavior
- **Client-Side Search**: Actor search is performed client-side even though backend supports query parameters

Recommended improvements:
1. Standardize all API methods to use `fetcher()` for consistency
2. Use relative URLs for downloads to leverage Vite proxy
3. Move search logic to backend query parameters

---

## 6. Python Samples

### 6.1 Script Index

| # | Filename | Actor/Feature | Status |
|---|----------|---------------|--------|
| 01 | `01_hello_world.py` | Basic API setup | ✅ Implemented |
| 02 | `02_website_content_crawler.py` | Website Content Crawler | ✅ Implemented |
| 03-12 | Various | Multiple actors/features | ❌ Not yet created |

**Note**: Only scripts 01 and 02 are currently implemented. Scripts 03-12 are planned but not yet created.

---

## 7. CLI Specification

### 7.1 Command Structure

```
apify-lab <command> [subcommand] [options]

Commands:
  actors     Manage and run actors
  datasets   Browse and export datasets
  storage    Manage key-value stores
  runs       View and control runs

Global Options:
  --help, -h     Show help
  --version, -v  Show version
  --json         Output as JSON
```

### 7.2 Implementation Notes

The CLI (`cli/src/index.ts`) directly calls Apify API, bypassing the local Hono API server. This is intentional for learning purposes but creates a divergence in integration patterns between the web app and CLI.

All CLI commands are implemented and functional.

---

## 8. Known Gaps and Issues

### 8.1 Backend API
- **Missing Storage Routes**: `/api/storage` endpoints are not implemented
- **Hard Download Limit**: Dataset download pulls max 10,000 items into memory
- **No Input Validation**: Some routes lack Zod validation

### 8.2 Frontend Web
- **Broken Links**: Dashboard "View" links point to non-existent `/runs/:id` route
- **Storage Page Errors**: Storage page will 404 due to missing API routes
- **inconsistent API Client**: Mixed fetch patterns and response handling
- **Hardcoded URLs**: Download links bypass Vite proxy

### 8.3 Project Structure
- **Missing Files**: Multiple Python scripts referenced in README don't exist
- **Outdated Documentation**: OPENSPEC.md references features not yet built
- **No Test Suite**: No tests implemented yet

---

## 9. Environment Configuration

### 9.1 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `APIFY_API_TOKEN` | Yes | - | Apify API token from console |
| `API_PORT` | No | `3001` | Backend API server port |
| `WEB_PORT` | No | `5173` | Frontend dev server port |
| `NODE_ENV` | No | `development` | Environment mode |

### 9.2 .env.example

```bash
# Apify API Configuration
# Get your token from: https://console.apify.com/account/integrations
APIFY_API_TOKEN=your_apify_api_token_here

# Server Configuration (optional)
API_PORT=3001
WEB_PORT=5173

# Environment
NODE_ENV=development
```

---

## 10. Development Workflow

### 10.1 Setup Commands

```bash
# Clone and setup
cd how-to-use-appify
bun install

# Copy environment file
cp .env.example .env
# Edit .env with your API token

# Start backend API
bun run dev:api

# Start frontend (in another terminal)
bun run dev:web

# Run Python samples
cd python-samples
pip install -r requirements.txt
python 01_hello_world.py

# Use CLI
cd cli
bun run cli actors list
```

### 10.2 Available Scripts

```json
{
  "scripts": {
    "dev": "bun run dev:api & bun run dev:web",
    "dev:api": "bun run --hot packages/api/src/index.ts",
    "dev:web": "bun run --cwd packages/web dev",
    "build": "bun run build:api && bun run build:web",
    "build:api": "bun build packages/api/src/index.ts --outdir dist/api",
    "build:web": "bun run --cwd packages/web build",
    "test": "bun test",
    "lint": "bunx biome check .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

## 11. Testing Strategy

**Not yet implemented.**

Recommended approach:
- Unit tests for `ApifyClient` service methods
- Integration tests for API routes using Hono's test utilities
- Component tests for React components using React Testing Library
- E2E tests for critical user flows (actor run, dataset viewing)

---

## 12. Deployment Considerations

### 12.1 Production Checklist

- [ ] Environment variables secured
- [ ] API rate limiting implemented  
- [ ] Error logging configured
- [ ] CORS properly configured
- [ ] Static assets optimized
- [ ] Health checks verified
- [ ] Missing storage routes implemented
- [ ] Frontend API client inconsistencies resolved
- [ ] All referenced Python scripts created

### 12.2 Recommended Hosting

| Component | Platform Options |
|-----------|------------------|
| Backend | Railway, Fly.io, Render |
| Frontend | Vercel, Netlify, Cloudflare Pages |
| Full-stack | Coolify, CapRover (self-hosted) |

---

## 13. Appendix

### 13.1 Apify API Reference

- Base URL: `https://api.apify.com/v2`
- Documentation: https://docs.apify.com/api/v2
- OpenAPI Spec: https://docs.apify.com/api/openapi.yaml

### 13.2 Rate Limits

| Limit Type | Value |
|------------|-------|
| Global | 250,000 requests/minute |
| Per-resource | 60 requests/second |
| Dataset items | 400 requests/second |

### 13.3 Useful Links

- Apify Console: https://console.apify.com
- Apify Store: https://apify.com/store
- Apify Academy: https://docs.apify.com/academy
- Crawlee (OSS): https://crawlee.dev

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12-14 | AI Assistant | Initial specification |
| 1.0.1 | 2024-12-14 | AI Assistant | Updated to reflect actual implementation, documented gaps and inconsistencies |