# Python Samples for Apify Learning Lab

This directory contains standalone Python scripts demonstrating various Apify features.

## Setup

1. **Create a virtual environment (optional but recommended):**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your API token:**
   ```bash
   export APIFY_API_TOKEN="your_token_here"
   ```
   
   Or if you've added it to `~/.bash_secrets`:
   ```bash
   source ~/.bash_secrets
   ```

## Sample Scripts

### Beginner

| Script | Description | Actor Used |
|--------|-------------|------------|
| `01_hello_world.py` | Basic API setup and authentication | None (user API) |
| `02_website_content_crawler.py` | Crawl websites for AI/LLM data | `apify/website-content-crawler` |

### Intermediate

| Script | Description | Actor Used |
|--------|-------------|------------|
| `03_web_scraper_custom.py` | Custom JavaScript page functions | `apify/web-scraper` |
| `04_google_maps_scraper.py` | Extract business data | `compass/crawler-google-places` |

### Social Media

| Script | Description | Actor Used |
|--------|-------------|------------|
| `05_instagram_scraper.py` | Scrape Instagram profiles/posts | `apify/instagram-scraper` |
| `06_tiktok_scraper.py` | Extract TikTok videos/profiles | `clockworks/free-tiktok-scraper` |
| `07_twitter_scraper.py` | Scrape tweets and profiles | `apidojo/twitter-scraper-lite` |

### E-commerce

| Script | Description | Actor Used |
|--------|-------------|------------|
| `08_amazon_scraper.py` | Product data extraction | `junglee/amazon-crawler` |

### Advanced (Storage & Management)

| Script | Description | Feature |
|--------|-------------|---------|
| `09_dataset_operations.py` | CRUD operations on datasets | Datasets API |
| `10_key_value_store.py` | Store and retrieve data | Key-Value Stores API |
| `11_run_management.py` | Monitor and control runs | Runs API |
| `12_scheduled_tasks.py` | Schedule recurring runs & webhooks | Schedules API |

**All 12 scripts are now available!**

## Running Scripts

Each script is self-contained and can be run directly:

```bash
python 01_hello_world.py
```

Scripts use the `rich` library for colorful terminal output. If you prefer plain output, you can modify the scripts to use regular `print()` statements.

## Learning Path

1. **Start with Hello World** - Understand the client basics
2. **Try Website Content Crawler** - See how actors work
3. **Explore Social Media scrapers** - Learn about different actor types
4. **Master Storage APIs** - Understand datasets and key-value stores
5. **Build Automations** - Set up scheduled runs

## Cost Considerations

- Most scripts are designed to use minimal resources for learning
- `maxCrawlPages` and `resultsLimit` are set low by default
- Some actors have pay-per-result pricing - check before heavy usage
- Free tier gives you $5/month - plenty for learning!

## Resources

- [Apify Python Client Docs](https://docs.apify.com/api/client/python)
- [Apify Academy](https://docs.apify.com/academy)
- [Actor Store](https://apify.com/store)
