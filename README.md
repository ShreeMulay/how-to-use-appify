# Apify Learning Lab

A comprehensive learning environment for mastering [Apify.com](https://apify.com) - the web scraping, automation, and data extraction platform.

## What is Apify?

Apify is a full-stack platform for web scraping and automation that provides:

- **Actors** - Serverless cloud programs for web scraping and automation
- **Apify Store** - Marketplace with 10,000+ pre-built scrapers and tools
- **Storage** - Datasets, key-value stores, and request queues
- **Proxy** - Rotating proxies and anti-blocking solutions
- **API** - RESTful API for programmatic access to all features

## Project Overview

This learning lab provides three complementary approaches to learning Apify:

| Approach | Location | Description |
|----------|----------|-------------|
| **Web Dashboard** | `packages/web` | Interactive React app for exploring and running actors |
| **Python Samples** | `python-samples/` | Standalone scripts demonstrating various features |
| **CLI Playground** | `cli/` | Command-line tool for quick API interactions |

## Quick Start

### Prerequisites

- [Bun](https://bun.sh) v1.0+ (JavaScript runtime)
- [Python](https://python.org) 3.12+ (for Python samples)
- [Apify Account](https://console.apify.com/sign-up) (free tier available)

### 1. Clone & Setup

```bash
cd how-to-use-appify
bun install
```

### 2. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your Apify API token
# Get your token from: https://console.apify.com/account/integrations
```

Or if you've added the token to `~/.bash_secrets`:
```bash
source ~/.bash_secrets
```

### 3. Run the Development Server

```bash
# Start both API and web servers
bun run dev

# Or start individually:
bun run dev:api  # API server on http://localhost:3001
bun run dev:web  # Web app on http://localhost:5173
```

### 4. Try Python Samples

```bash
cd python-samples
pip install -r requirements.txt
python 01_hello_world.py
```

### 5. Use the CLI

```bash
# List available actors
bun run cli actors list

# Run an actor
bun run cli actors run apify/website-content-crawler
```

## Project Structure

```
how-to-use-appify/
├── packages/
│   ├── api/              # Hono API server (backend)
│   │   └── src/
│   │       ├── routes/   # API endpoints
│   │       ├── services/ # Apify client wrapper
│   │       └── types/    # TypeScript definitions
│   │
│   └── web/              # React + shadcn/ui (frontend)
│       └── src/
│           ├── components/
│           ├── hooks/
│           └── lib/
│
├── python-samples/       # Python learning scripts
│   ├── 01_hello_world.py
│   ├── 02_website_crawler.py
│   └── ... (12 scripts total)
│
├── cli/                  # CLI playground
│   └── src/
│       └── commands/
│
├── .env.example          # Environment template
├── package.json          # Bun workspace config
└── OPENSPEC.md           # Detailed specification
```

## Learning Path

### Beginner

1. **Hello World** (`python-samples/01_hello_world.py`)
   - Set up API authentication
   - Make your first API call
   - Understand the client basics

2. **Website Content Crawler** (`python-samples/02_website_crawler.py`)
   - Run a pre-built actor
   - Configure actor inputs
   - Retrieve and process results

3. **Web Dashboard** (http://localhost:5173)
   - Browse popular actors
   - Run actors with custom inputs
   - View results in real-time

### Intermediate

4. **Custom Web Scraper** (`python-samples/03_web_scraper_custom.py`)
   - Write custom page functions
   - Extract specific data from pages
   - Handle pagination and navigation

5. **Dataset Operations** (`python-samples/09_dataset_operations.py`)
   - Create and manage datasets
   - Push and retrieve items
   - Export data in various formats

6. **Key-Value Store** (`python-samples/10_key_value_store.py`)
   - Store persistent data
   - Cache between runs
   - Share data across actors

### Advanced

7. **Social Media Scrapers** (scripts 05-07)
   - Instagram, TikTok, Twitter data extraction
   - Handle rate limiting
   - Process large datasets

8. **Run Management** (`python-samples/11_run_management.py`)
   - Monitor actor runs
   - Handle failures and retries
   - Optimize performance

9. **Scheduled Tasks** (`python-samples/12_scheduled_tasks.py`)
   - Automate recurring scrapes
   - Set up webhooks
   - Build data pipelines

## Curated Actors

The learning lab focuses on these popular actors:

### AI/LLM Data

| Actor | Description | Difficulty |
|-------|-------------|------------|
| `apify/website-content-crawler` | Crawl sites for AI training data | Beginner |
| `apify/rag-web-browser` | Single URL extraction for RAG | Beginner |

### Social Media

| Actor | Description | Difficulty |
|-------|-------------|------------|
| `apify/instagram-scraper` | Posts, profiles, hashtags | Beginner |
| `clockworks/free-tiktok-scraper` | Videos, profiles | Beginner |
| `apidojo/twitter-scraper-lite` | Tweets, search results | Beginner |

### Business Data

| Actor | Description | Difficulty |
|-------|-------------|------------|
| `apify/google-maps-scraper` | Business listings, reviews | Beginner |
| `compass/crawler-google-places` | Local business data | Beginner |

### E-commerce

| Actor | Description | Difficulty |
|-------|-------------|------------|
| `junglee/amazon-product-scraper` | Product data, prices | Beginner |
| `epctex/ebay-scraper` | Listings, auctions | Beginner |

### Developer Tools

| Actor | Description | Difficulty |
|-------|-------------|------------|
| `apify/web-scraper` | Custom JS page functions | Intermediate |
| `apify/puppeteer-scraper` | Full browser control | Advanced |
| `apify/playwright-scraper` | Multi-browser support | Advanced |

## API Reference

The backend provides a REST API that wraps Apify's API:

### Actors
```
GET  /api/actors/popular         # List curated actors
GET  /api/actors/:id             # Get actor details
POST /api/actors/:id/run         # Run an actor
GET  /api/actors/:id/runs/:runId # Get run status
```

### Datasets
```
GET  /api/datasets               # List datasets
GET  /api/datasets/:id/items     # Get dataset items
POST /api/datasets/:id/items     # Push items
```

### Storage
```
GET  /api/storage                # List key-value stores
GET  /api/storage/:id/records/:key  # Get record
PUT  /api/storage/:id/records/:key  # Set record
```

### Runs
```
GET  /api/runs                   # List recent runs
POST /api/runs/:id/abort         # Abort a run
```

## Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun 1.3.3 |
| Backend | Hono |
| Frontend | React 19 + shadcn/ui v4 |
| Styling | Tailwind CSS 4 |
| Python | 3.12.8 |

## Resources

- [Apify Documentation](https://docs.apify.com)
- [Apify API Reference](https://docs.apify.com/api/v2)
- [Apify Academy](https://docs.apify.com/academy)
- [Apify Store](https://apify.com/store)
- [Crawlee (Open Source)](https://crawlee.dev)

## Contributing

This is a learning project. Feel free to:

- Add more Python sample scripts
- Improve the web dashboard
- Add new CLI commands
- Fix bugs and improve documentation

## License

MIT License - See [LICENSE](LICENSE) for details.

---

**Happy Scraping!** If you have questions, check the [Apify Discord](https://discord.com/invite/jyEM2PRvMU) community.
