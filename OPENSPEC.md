# OpenSpec: Apify Learning Lab

## Document Information

| Field | Value |
|-------|-------|
| **Project Name** | Apify Learning Lab |
| **Repository** | `how-to-use-appify` |
| **Version** | 1.0.1 |
| **Created** | 2024-12-14 |
| **Last Updated** | 2025-12-15 |
| **Status** | Functional MVP |

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
| Runtime | Bun | 1.3.3 | JavaScript/TypeScript runtime |
| Backend | Hono | 4.6.x | Lightweight web framework |
| Frontend | React | 19.x | UI library |
| UI Components | shadcn/ui | v4 | Pre-built accessible components |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
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
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐               │   │
│  │  │ /actors │ │/datasets│ │  /runs  │               │   │
│  │  └─────────┘ └─────────┘ └─────────┘               │   │
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
│   │       │   └── runs.ts           # Run management endpoints
│   │       ├── services/
│   │       │   └── apify-client.ts   # Apify API wrapper
│   │       ├── middleware/
│   │       │   └── error-handler.ts  # Global error handling
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
│           ├── pages/                # Route-level pages
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
    ├── README.md
    └── src/
        ├── index.ts                  # CLI entry point
        ├── commands/                 # Command implementations
        └── lib/                      # Shared utilities
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

**Implementation Status:** ✅ **Implemented**

**Query Parameters (optional):**
- `category` (string)
- `difficulty` (string) 
- `search` (string) ⚠️ TODO - filtering not yet implemented

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
      "documentationUrl": "https://apify.com/apify/website-content-crawler"
    }
  ],
  "meta": {
    "total": 1,
    "categories": ["ai-llm"]
  }
}
```

#### GET /api/actors/:actorId

Returns detailed actor information from Apify API.

**Parameters:**
- `actorId` (path) - Actor ID (e.g., `apify/website-content-crawler`)

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
    "versions": [...]
  }
}
```

#### GET /api/actors/:actorId/input-schema

Returns the input schema for an actor.

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

**Implementation Status:** ✅ **Implemented**

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

**Query Parameters:**
- `stream` (boolean) - Enable streaming (default: false)

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

**Implementation Status:** ✅ **Implemented** (via `/api/runs/:runId/abort`)

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
- `limit` (number) - Max items (default: 50, max: 1000)
- `offset` (number) - Pagination offset (default: 0)
- `clean` (boolean) - Exclude metadata fields (default: true)
- `desc` (boolean) - Sort descending (default: false)
- `fields` (string) - Comma-separated list of fields to return

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
    "offset": 0,
    "limit": 50
  }
}
```

#### POST /api/datasets/:datasetId/items

Pushes items to a dataset.

**Implementation Status:** ❌ **Not Implemented** - ⚠️ TODO

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

Downloads dataset items as CSV or JSON.

**Query Parameters:**
- `format` (string) - `json` or `csv` (default: `json`)

**Response:**
- For `format=json`: JSON array of items with `Content-Disposition` attachment headers
- For `format=csv`: CSV text with `Content-Type: text/csv` and `Content-Disposition` attachment headers

#### DELETE /api/datasets/:datasetId

Deletes a dataset.

**Implementation Status:** ❌ **Not Implemented** - ⚠️ TODO

**Response:**
```json
{
  "data": {
    "success": true
  }
}
```

### 3.4 Storage Endpoints (Key-Value Stores)

Not implemented in `packages/api` in this version. ⚠️ **TODO** 

Status: **Not Available**
- The frontend has a Storage page component (`packages/web/src/pages/Storage.tsx`) but it 404s due to missing API routes
- Key-value store support exists in the backend Apify client wrapper (`packages/api/src/services/apify-client.ts`) and CLI client (`cli/src/lib/client.ts`)
- Need to implement `/api/storage` router in Hono API server

### 3.5 Runs Endpoints

#### GET /api/runs

Lists recent actor runs.

**Query Parameters:**
- `limit` (number) - Max results (default: 20)
- `offset` (number) - Pagination offset
- `status` (string) - Filter by status: RUNNING, SUCCEEDED, FAILED, ABORTED

**Response:**
```json
{
  "data": {
    "items": [
      {
        "id": "run123",
        "actId": "aYG0l9s7dbB7j3gbS",
        "actName": "website-content-crawler",
        "status": "SUCCEEDED",
        "startedAt": "2024-12-14T10:00:00.000Z",
        "finishedAt": "2024-12-14T10:05:00.000Z"
      }
    ],
    "total": 100
  }
}
```

#### GET /api/runs/:runId

Returns detailed run information.
**Implementation Status:** ✅ **Implemented**

#### GET /api/runs/:runId/log

Returns run log content.
**Implementation Status:** ❌ **Not Implemented** - ⚠️ TODO

#### POST /api/runs/:runId/abort

Aborts a running actor.
**Implementation Status:** ✅ **Implemented**

#### POST /api/runs/:runId/resurrect

Resurrects a finished run.
**Implementation Status:** ❌ **Not Implemented** - ⚠️ TODO

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
}

interface ActorStats {
  totalBuilds: number;
  totalRuns: number;
  totalUsers: number;
  lastRunStartedAt?: string;
}

interface PopularActor {
  id: string;
  name: string;
  description: string;
  category: ActorCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedCost: 'low' | 'medium' | 'high';
  documentationUrl: string;
}

type ActorCategory = 
  | 'ai-llm'
  | 'social-media'
  | 'business-data'
  | 'ecommerce'
  | 'developer-tools';

// Run Types
interface ActorRun {
  id: string;
  actId: string;
  status: RunStatus;
  startedAt: string;
  finishedAt?: string;
  stats: RunStats;
  defaultDatasetId: string;
  defaultKeyValueStoreId: string;
}

type RunStatus = 
  | 'READY'
  | 'RUNNING'
  | 'SUCCEEDED'
  | 'FAILED'
  | 'ABORTING'
  | 'ABORTED'
  | 'TIMING-OUT'
  | 'TIMED-OUT';

interface RunStats {
  inputBodyLen: number;
  durationMillis: number;
  resurrectCount: number;
  computeUnits: number;
}

// Dataset Types
interface Dataset {
  id: string;
  name?: string;
  itemCount: number;
  cleanItemCount: number;
  createdAt: string;
  modifiedAt: string;
}

interface DatasetItem {
  [key: string]: unknown;
}

// Key-Value Store Types
interface KeyValueStore {
  id: string;
  name?: string;
  createdAt: string;
  modifiedAt: string;
}

interface KeyValueRecord {
  key: string;
  value: unknown;
  contentType: string;
  size?: number;
}

// API Response Types
interface ApiResponse<T> {
  data: T;
  error?: never;
}

interface ApiError {
  data?: never;
  error: {
    type: string;
    message: string;
  };
}

type ApiResult<T> = ApiResponse<T> | ApiError;
```

---

## 5. Frontend Specification

### 5.1 Pages and Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Dashboard` | Overview with stats and recent activity |
| `/actors` | `ActorExplorer` | Browse curated actors |
| `/actors/:actorId` | `ActorRunner` | Actor info + run interface |
| `/datasets` | `Datasets` | Browse all datasets |
| `/datasets/:datasetId` | `DatasetViewer` | View dataset items |
| `/storage` | `Storage` | Browse key-value stores (⚠️ currently 404s - TODO: implement `/api/storage` route) |
| `/runs` | `Runs` | List all runs |

**Current Implementation Status: All core pages implemented except run details**

| Route | Component | Status | Notes |
|-------|-----------|---------|-------|
| `/` | `Dashboard` | ✅ Implemented | Overview with stats and recent activity |
| `/actors` | `ActorExplorer` | ✅ Implemented | Browse curated actors |
| `/actors/:actorId` | `ActorRunner` | ✅ Implemented | Actor info + run interface |
| `/datasets` | `Datasets` | ✅ Implemented | Browse all datasets |
| `/datasets/:datasetId` | `DatasetViewer` | ✅ Implemented | View dataset items |
| `/storage` | `Storage` | ⚠️ Partial | Frontend exists but 404s - missing API |
| `/runs` | `Runs` | ✅ Implemented | List all runs |

**Missing routes (TODO):**
- `/runs/:runId` (run details/log viewer) - ⚠️ TODO
- `/storage/:storeId` (store record viewer/editor) - ⚠️ TODO


### 5.2 Component Hierarchy

```
App
├── Layout
│   ├── Sidebar
│   │   ├── Navigation
│   │   └── UserInfo
│   └── Header
│       ├── Breadcrumbs
│       └── ThemeToggle
│
├── Dashboard
│   ├── StatsCards
│   ├── RecentRuns
│   └── QuickActions
│
├── ActorExplorer
│   ├── CategoryFilter
│   ├── SearchInput
│   └── ActorGrid
│       └── ActorCard
│
├── ActorDetail
│   ├── ActorHeader
│   ├── InputSchemaForm
│   ├── RunButton
│   └── RunStatusPanel
│
├── DatasetList
│   ├── DatasetTable
│   └── Pagination
│
├── DatasetViewer
│   ├── DatasetInfo
│   ├── DataTable
│   ├── ExportButton
│   └── Pagination
│
├── StorageManager
│   ├── StoreList
│   └── RecordEditor
│
└── RunHistory
    ├── RunFilters
    ├── RunTable
    └── RunLogViewer
```

### 5.3 shadcn/ui Components Required

| Component | Usage |
|-----------|-------|
| `button` | Actions, form submission |
| `card` | Actor cards, stat cards |
| `input` | Form inputs, search |
| `select` | Dropdowns, filters |
| `table` | Dataset items, run history |
| `tabs` | Page navigation |
| `dialog` | Modals, confirmations |
| `toast` | Notifications |
| `badge` | Status indicators |
| `skeleton` | Loading states |
| `scroll-area` | Log viewer |
| `form` | Input schema forms |
| `separator` | Visual dividers |
| `dropdown-menu` | Action menus |
| `command` | Command palette |
| `sidebar` | Navigation |

---

## 6. Python Samples Specification

### 6.1 Script Index

| # | Filename | Actor/Feature | Concepts Covered | Status |
|---|----------|---------------|------------------|---------|
| 01 | `01_hello_world.py` | Basic API | Client setup, authentication, user info | ✅ Implemented |
| 02 | `02_website_content_crawler.py` | `apify/website-content-crawler` | Running actors, getting results | ✅ Implemented |

**Implementation Status: 2 of 12 scripts completed (17%)**

Planned (not currently present in `python-samples/`):
- `03_web_scraper_custom.py` - ⚠️ TODO
- `04_google_maps_scraper.py` - ⚠️ TODO 
- `05_instagram_scraper.py` - ⚠️ TODO
- `06_tiktok_scraper.py` - ⚠️ TODO
- `07_twitter_scraper.py` - ⚠️ TODO
- `08_amazon_scraper.py` - ⚠️ TODO
- `09_dataset_operations.py` - ⚠️ TODO
- `10_key_value_store.py` - ⚠️ TODO
- `11_run_management.py` - ⚠️ TODO
- `12_scheduled_tasks.py` - ⚠️ TODO


### 6.2 Script Template

Each script follows this structure:

```python
#!/usr/bin/env python3
"""
Script Title
============

Description of what this script demonstrates.

Prerequisites:
- APIFY_API_TOKEN environment variable set
- apify-client package installed

Usage:
    python 01_hello_world.py

What you'll learn:
- Concept 1
- Concept 2
"""

import os
from apify_client import ApifyClient

# Configuration
APIFY_TOKEN = os.environ.get("APIFY_API_TOKEN")
if not APIFY_TOKEN:
    raise ValueError("APIFY_API_TOKEN environment variable not set")

def main():
    """Main function demonstrating the feature."""
    # Initialize client
    client = ApifyClient(APIFY_TOKEN)
    
    # ... implementation ...
    
    print("Done!")

if __name__ == "__main__":
    main()
```

---

## 7. CLI Specification

### 7.1 Command Structure

**Implementation Status:** ✅ **Fully Implemented**

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
  --json         Output as JSON (not yet implemented)
```

### 7.2 Command Details

#### Actors Commands

```bash
apify-lab actors list [--category <cat>] [--difficulty <level>]
apify-lab actors search <query>
apify-lab actors info <actorId>
apify-lab actors run <actorId> [--input <json>] [--wait]
```

#### Datasets Commands

```bash
apify-lab datasets list [--limit <n>]
apify-lab datasets show <datasetId> [--limit <n>] [--offset <n>]
apify-lab datasets export <datasetId> [--format json|csv] [--output <file>]
apify-lab datasets delete <datasetId> [--force]
```

#### Storage Commands

```bash
apify-lab storage list
apify-lab storage show <storeId>
apify-lab storage get <storeId> <key>
apify-lab storage set <storeId> <key> [--value <json>]
apify-lab storage delete <storeId> <key>
```

#### Runs Commands

```bash
apify-lab runs list [--status <status>] [--limit <n>]
apify-lab runs show <runId>
apify-lab runs logs <runId> [--follow]
apify-lab runs abort <runId>
apify-lab runs resurrect <runId>
```

---

## 8. Popular Actors Database

### 8.1 Actor Categories

#### AI/LLM Data Extraction

| Actor ID | Name | Input Example |
|----------|------|---------------|
| `apify/website-content-crawler` | Website Content Crawler | `{"startUrls": [{"url": "https://docs.example.com"}], "maxCrawlPages": 100}` |
| `apify/rag-web-browser` | RAG Web Browser | `{"query": "what is web scraping", "maxResults": 5}` |
| `apify/cheerio-scraper` | Cheerio Scraper | `{"startUrls": [{"url": "https://example.com"}]}` |

#### Social Media

| Actor ID | Name | Input Example |
|----------|------|---------------|
| `apify/instagram-scraper` | Instagram Scraper | `{"directUrls": ["https://instagram.com/apaborena"], "resultsLimit": 30}` |
| `clockworks/free-tiktok-scraper` | TikTok Scraper | `{"profiles": ["tiktok"], "resultsPerPage": 10}` |
| `apidojo/twitter-scraper-lite` | Twitter/X Scraper | `{"searchTerms": ["web scraping"], "maxTweets": 100}` |
| `apify/facebook-posts-scraper` | Facebook Posts | `{"startUrls": [{"url": "https://facebook.com/apaborena"}]}` |

#### Business Data

| Actor ID | Name | Input Example |
|----------|------|---------------|
| `apify/google-maps-scraper` | Google Maps | `{"searchStringsArray": ["restaurants in NYC"], "maxCrawledPlaces": 50}` |
| `compass/crawler-google-places` | Google Places | `{"searchQuery": "coffee shops", "location": "San Francisco"}` |
| `bebity/linkedin-profile-scraper` | LinkedIn | `{"profileUrls": ["https://linkedin.com/in/example"]}` |

#### E-commerce

| Actor ID | Name | Input Example |
|----------|------|---------------|
| `junglee/amazon-product-scraper` | Amazon Products | `{"categoryUrls": ["https://amazon.com/s?k=laptop"]}` |
| `epctex/ebay-scraper` | eBay | `{"searchQuery": "vintage watches", "maxItems": 100}` |

#### Developer Tools

| Actor ID | Name | Input Example |
|----------|------|---------------|
| `apify/web-scraper` | Web Scraper | `{"startUrls": [{"url": "https://example.com"}], "pageFunction": "..."}` |
| `apify/puppeteer-scraper` | Puppeteer | `{"startUrls": [...], "pageFunction": "..."}` |
| `apify/playwright-scraper` | Playwright | `{"startUrls": [...], "pageFunction": "..."}` |

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
bun install
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

### 11.1 Testing Status

**Current Implementation: ❌ No Tests Implemented**

- No test files found in `packages/api/tests/` directory
- No test coverage metrics available
- Testing framework (Bun test) is configured but no tests written

### 11.2 Test Coverage Goals

**Test Coverage Status: 0%**

| Area | Target | Current | Status |
|------|--------|---------|--------|
| API Routes | 80% | 0% | ⚠️ TODO |
| Apify Client | 70% | 0% | ⚠️ TODO |
| Utilities | 90% | 0% | ⚠️ TODO |

**Sample Test Structure (TODO):**
```typescript
// packages/api/tests/actors.test.ts
import { describe, it, expect } from "bun:test";
import app from "../src/index";

describe("Actors API", () => {
  it("should return popular actors", async () => {
    const res = await app.request("/api/actors/popular");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toBeArray();
  });
});
```

---

## 12. Deployment Considerations

### 12.1 Production Checklist

**Production Readiness Status: Partial**

- [x] Environment variables secured
- [ ] API rate limiting implemented ⚠️ TODO
- [x] Error logging configured
- [x] CORS properly configured
- [x] Static assets optimized
- [x] Health checks verified

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

## 14. Implementation Status Summary

### 14.1 Overall Project Status: **Functional MVP** ✅

The Apify Learning Lab is now a working MVP with the core functionality operational. Users can:

- ✅ Explore and run actors through the web interface
- ✅ View and manage datasets
- ✅ Monitor run history
- ✅ Use the CLI for quick operations
- ✅ Run basic Python learning scripts

### 14.2 Component Status Overview

| Component | Status | Progress | Notes |
|-----------|---------|----------|-------|
| **Backend API (Hono)** | ✅ Functional | 85% | Core endpoints implemented, missing some features |
| **Frontend (React/Shadcn)** | ✅ Functional | 90% | All main pages working, storage page needs API |
| **CLI (Commander.js)** | ✅ Functional | 95% | Nearly complete, missing --json output |
| **Python Samples** | ⚠️ Partial | 17% | Only 2 of 12 scripts implemented |
| **Testing** | ❌ Missing | 0% | No tests written yet |
| **Documentation** | ✅ Complete | 95% | Comprehensive spec with status tracking |

### 14.3 Key Achievement Highlights

✅ **Working Actor Explorer**: Browse curated actors and run them with custom inputs  
✅ **Dataset Management**: List, view, and export dataset items  
✅ **Run Monitoring**: Track actor runs and view results  
✅ **CLI Tool**: Terminal-based workflow for power users  
✅ **Modern Tech Stack**: Bun, Hono, React 19, shadcn/ui v4  

### 14.4 Remaining TODOs (High Priority)

| Area | Feature | Status | Impact |
|------|---------|--------|--------|
| **API** | Storage endpoints (`/api/storage`) | ❌ Missing | Storage page 404s |
| **API** | Run log endpoint (`/api/runs/:runId/log`) | ❌ Missing | Can't view run logs |
| **API** | Dataset write operations | ❌ Missing | Can't push/delete items |
| **Frontend** | Run details page (`/runs/:runId`) | ❌ Missing | No detailed run view |
| **Python** | 10 remaining sample scripts | ❌ Missing | Incomplete learning path |
| **Testing** | Unit & integration tests | ❌ Missing | No confidence in code |
| **CLI** | JSON output format | ⚠️ Partial | Limited automation use |

### 14.5 Quick Start for New Users

The MVP is fully functional for learning Apify basics:

```bash
# 1. Setup the project
cd how-to-use-appify
bun install
cp .env.example .env  # Add your APIFY_API_TOKEN

# 2. Start both servers
bun run dev  # Starts API (:3001) + Web (:5173)

# 3. Try the CLI
bun run cli actors list
bun run cli actors run apify/website-content-crawler -i '{"startUrls":[{"url":"https://example.com"}]}'

# 4. Run Python samples
cd python-samples
pip install -r requirements.txt
python 01_hello_world.py
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2024-12-14 | AI Assistant | Initial specification |
| 1.0.1 | 2025-12-15 | AI Assistant | Align spec to current repo (routes, pages, CLI, python samples) |
| 1.0.2 | 2025-12-15 | AI Assistant | Add implementation status indicators throughout document |
