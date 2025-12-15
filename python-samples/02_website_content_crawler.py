#!/usr/bin/env python3
"""
02 - Website Content Crawler
============================

This script demonstrates how to use the Website Content Crawler actor
to extract text content from websites for AI/LLM applications.

The Website Content Crawler is perfect for:
    - Feeding data to LLMs and chatbots
    - Building RAG (Retrieval-Augmented Generation) pipelines
    - Creating knowledge bases
    - Training AI models on web content

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 02_website_content_crawler.py

What you'll learn:
    - How to run a pre-built actor
    - How to configure actor inputs
    - How to retrieve and process results
    - How to work with datasets
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.markdown import Markdown

console = Console()


def main():
    """Demonstrate the Website Content Crawler actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]02 - Website Content Crawler[/dim]",
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
    # Configuration
    # =========================================================================
    
    # The actor we'll use
    ACTOR_ID = "apify/website-content-crawler"
    
    # Configure the crawl - customize these for your use case!
    run_input = {
        # Start URL(s) - the website to crawl
        "startUrls": [
            {"url": "https://docs.apify.com/academy/web-scraping-for-beginners"}
        ],
        
        # Maximum number of pages to crawl (keep low for testing)
        "maxCrawlPages": 5,
        
        # Crawler type: 
        # - "playwright:firefox" for JavaScript-heavy sites
        # - "cheerio" for simple static sites (faster, cheaper)
        "crawlerType": "playwright:firefox",
        
        # Include URLs matching these patterns
        "includeUrlGlobs": [],
        
        # Exclude URLs matching these patterns
        "excludeUrlGlobs": [],
        
        # Output format options
        "saveMarkdown": True,
        "saveHtml": False,
        "saveScreenshots": False,
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Start URL: [green]{run_input['startUrls'][0]['url']}[/green]")
    console.print(f"  Max Pages: [green]{run_input['maxCrawlPages']}[/green]")
    
    # =========================================================================
    # Run the Actor
    # =========================================================================
    
    console.print("\n[bold cyan]Running the crawler...[/bold cyan]")
    console.print("  [dim]This may take 1-2 minutes depending on the website[/dim]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Starting actor run...", total=None)
        
        try:
            # Run the actor and wait for it to finish
            run = client.actor(ACTOR_ID).call(run_input=run_input)
            
            progress.update(task, description="[green]✓ Actor run completed!")
            
        except Exception as e:
            progress.update(task, description=f"[red]✗ Error: {e}")
            sys.exit(1)
    
    # =========================================================================
    # Process Results
    # =========================================================================
    
    console.print("\n[bold cyan]Results:[/bold cyan]")
    
    # Get the dataset ID from the run
    dataset_id = run.get("defaultDatasetId")
    console.print(f"  Dataset ID: [green]{dataset_id}[/green]")
    
    # Fetch items from the dataset
    dataset_client = client.dataset(dataset_id)
    items = list(dataset_client.iterate_items())
    
    console.print(f"  Pages crawled: [green]{len(items)}[/green]")
    
    # Display results
    if items:
        console.print("\n[bold cyan]Crawled Pages:[/bold cyan]\n")
        
        table = Table(show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("URL", style="cyan", max_width=50)
        table.add_column("Title", style="green", max_width=40)
        table.add_column("Text Length", style="yellow", justify="right")
        
        for i, item in enumerate(items, 1):
            url = item.get("url", "Unknown")
            title = item.get("metadata", {}).get("title", "No title")
            text_length = len(item.get("text", ""))
            
            # Truncate long values
            if len(url) > 47:
                url = url[:47] + "..."
            if len(title) > 37:
                title = title[:37] + "..."
            
            table.add_row(str(i), url, title, f"{text_length:,} chars")
        
        console.print(table)
        
        # Show a sample of the extracted content
        console.print("\n[bold cyan]Sample Content (first page):[/bold cyan]\n")
        
        first_item = items[0]
        
        # Show metadata
        metadata = first_item.get("metadata", {})
        console.print(f"  [bold]Title:[/bold] {metadata.get('title', 'N/A')}")
        console.print(f"  [bold]Description:[/bold] {metadata.get('description', 'N/A')[:100]}...")
        console.print(f"  [bold]Language:[/bold] {metadata.get('languageCode', 'N/A')}")
        
        # Show content preview
        text = first_item.get("text", "")
        if text:
            preview = text[:500] + "..." if len(text) > 500 else text
            console.print(f"\n  [bold]Content Preview:[/bold]")
            console.print(Panel(preview, border_style="dim", width=70))
        
        # Show markdown if available
        markdown = first_item.get("markdown", "")
        if markdown:
            console.print(f"\n  [bold]Markdown available:[/bold] {len(markdown):,} characters")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Crawl Complete![/bold green]\n\n"
        f"Pages crawled: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[dim]View results in Apify Console:[/dim]\n"
        f"https://console.apify.com/storage/datasets/{dataset_id}\n\n"
        f"[bold]Common use cases for this data:[/bold]\n"
        f"  • Feed to ChatGPT/Claude for Q&A\n"
        f"  • Store in vector database (Pinecone, Qdrant)\n"
        f"  • Create embeddings for semantic search\n"
        f"  • Build RAG pipelines with LangChain",
        title="🎉 Website Crawler Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
