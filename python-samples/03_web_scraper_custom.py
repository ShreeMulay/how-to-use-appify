#!/usr/bin/env python3
"""
03 - Custom Web Scraper with Page Functions
===========================================

This script demonstrates how to use the Web Scraper actor with custom
JavaScript page functions to extract specific data from websites.

The Web Scraper actor allows you to write custom JavaScript that runs
in the browser context, giving you full control over what data to extract.

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 03_web_scraper_custom.py

What you'll learn:
    - How to write custom page functions
    - How to configure link selectors
    - How to extract structured data
    - Working with different scraper types
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.syntax import Syntax

console = Console()


# Custom JavaScript page function that runs in the browser
# This example extracts article data from a news-style page
PAGE_FUNCTION = """
async function pageFunction(context) {
    const { request, log, jQuery: $ } = context;
    
    log.info(`Processing ${request.url}`);
    
    // Extract data from the page using jQuery-like selectors
    const title = $('h1').first().text().trim() || $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Extract all links on the page
    const links = [];
    $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        const text = $(el).text().trim();
        if (href && text && !href.startsWith('#')) {
            links.push({ href, text: text.substring(0, 100) });
        }
    });
    
    // Extract all headings
    const headings = [];
    $('h1, h2, h3').each((i, el) => {
        headings.push({
            level: el.tagName.toLowerCase(),
            text: $(el).text().trim()
        });
    });
    
    // Extract images
    const images = [];
    $('img[src]').each((i, el) => {
        const src = $(el).attr('src');
        const alt = $(el).attr('alt') || '';
        if (src) {
            images.push({ src, alt });
        }
    });
    
    // Return structured data
    return {
        url: request.url,
        title,
        description,
        headingsCount: headings.length,
        headings: headings.slice(0, 10),  // Limit to first 10
        linksCount: links.length,
        sampleLinks: links.slice(0, 5),   // Sample of 5 links
        imagesCount: images.length,
        timestamp: new Date().toISOString()
    };
}
"""


def main():
    """Demonstrate the Web Scraper actor with custom page functions."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]03 - Custom Web Scraper with Page Functions[/dim]",
        border_style="blue"
    ))
    
    # Check for API token
    api_token = os.environ.get("APIFY_API_TOKEN")
    if not api_token:
        console.print("[red]Error:[/red] APIFY_API_TOKEN not set!")
        sys.exit(1)
    
    from apify_client import ApifyClient
    client = ApifyClient(api_token)
    
    # =========================================================================
    # Show the Page Function
    # =========================================================================
    
    console.print("\n[bold cyan]Custom Page Function:[/bold cyan]")
    console.print("[dim]This JavaScript runs in the browser for each page:[/dim]\n")
    
    syntax = Syntax(PAGE_FUNCTION.strip(), "javascript", theme="monokai", line_numbers=True)
    console.print(syntax)
    
    # =========================================================================
    # Configuration
    # =========================================================================
    
    ACTOR_ID = "apify/web-scraper"
    
    run_input = {
        # Starting URL(s)
        "startUrls": [
            {"url": "https://news.ycombinator.com/"}
        ],
        
        # How to find links to follow
        "linkSelector": "a[href]",
        
        # Which pages to actually scrape (glob patterns)
        "pseudoUrls": [
            {"purl": "https://news.ycombinator.com/item?id=[.*]"}
        ],
        
        # The custom page function
        "pageFunction": PAGE_FUNCTION,
        
        # Crawler settings
        "maxRequestsPerCrawl": 10,  # Limit for demo
        "maxConcurrency": 5,
        
        # Use Puppeteer for JavaScript rendering
        "proxyConfiguration": {
            "useApifyProxy": False
        },
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Start URL: [green]{run_input['startUrls'][0]['url']}[/green]")
    console.print(f"  Max Requests: [green]{run_input['maxRequestsPerCrawl']}[/green]")
    
    # =========================================================================
    # Run the Actor
    # =========================================================================
    
    console.print("\n[bold cyan]Running the scraper...[/bold cyan]")
    console.print("  [dim]This may take 1-2 minutes[/dim]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Starting actor run...", total=None)
        
        try:
            run = client.actor(ACTOR_ID).call(run_input=run_input)
            progress.update(task, description="[green]✓ Actor run completed!")
        except Exception as e:
            progress.update(task, description=f"[red]✗ Error: {e}")
            console.print(f"\n[red]Full error:[/red] {e}")
            sys.exit(1)
    
    # =========================================================================
    # Process Results
    # =========================================================================
    
    console.print("\n[bold cyan]Results:[/bold cyan]")
    
    dataset_id = run.get("defaultDatasetId")
    console.print(f"  Dataset ID: [green]{dataset_id}[/green]")
    
    # Fetch items
    dataset_client = client.dataset(dataset_id)
    items = list(dataset_client.iterate_items())
    
    console.print(f"  Pages scraped: [green]{len(items)}[/green]")
    
    if items:
        # Summary table
        table = Table(title="Scraped Pages", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Title", style="cyan", max_width=40)
        table.add_column("Headings", style="yellow", justify="right")
        table.add_column("Links", style="green", justify="right")
        table.add_column("Images", style="blue", justify="right")
        
        for i, item in enumerate(items, 1):
            title = item.get("title", "Unknown")[:37]
            if len(item.get("title", "")) > 37:
                title += "..."
            
            table.add_row(
                str(i),
                title,
                str(item.get("headingsCount", 0)),
                str(item.get("linksCount", 0)),
                str(item.get("imagesCount", 0))
            )
        
        console.print("\n")
        console.print(table)
        
        # Show sample data from first item
        if items:
            console.print("\n[bold cyan]Sample Extracted Data (first page):[/bold cyan]\n")
            
            first = items[0]
            console.print(f"  [bold]URL:[/bold] {first.get('url', 'N/A')}")
            console.print(f"  [bold]Title:[/bold] {first.get('title', 'N/A')}")
            
            headings = first.get("headings", [])
            if headings:
                console.print(f"\n  [bold]Headings (first 5):[/bold]")
                for h in headings[:5]:
                    console.print(f"    [{h.get('level', '?')}] {h.get('text', '')[:60]}")
            
            links = first.get("sampleLinks", [])
            if links:
                console.print(f"\n  [bold]Sample Links:[/bold]")
                for link in links[:3]:
                    console.print(f"    • {link.get('text', 'No text')[:40]} → {link.get('href', '')[:40]}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Scraping Complete![/bold green]\n\n"
        f"Pages scraped: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Key Concepts Learned:[/bold]\n"
        f"  • pageFunction runs in browser context\n"
        f"  • Use jQuery-style selectors ($)\n"
        f"  • Return structured data objects\n"
        f"  • linkSelector + pseudoUrls control crawling\n\n"
        f"[dim]Tip: Modify the PAGE_FUNCTION variable to extract\n"
        f"different data for your specific use case![/dim]",
        title="🎉 Custom Web Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
