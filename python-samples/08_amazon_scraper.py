#!/usr/bin/env python3
"""
08 - Amazon Product Scraper
===========================

This script demonstrates how to use the Amazon Scraper actor
to extract product data, prices, and reviews from Amazon.

Perfect for:
    - Price monitoring
    - Competitive analysis
    - Product research
    - Market intelligence
    - Dropshipping research

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 08_amazon_scraper.py

What you'll learn:
    - How to search for products
    - How to extract pricing information
    - How to get product reviews
    - Working with e-commerce data
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()


def main():
    """Demonstrate the Amazon Scraper actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]08 - Amazon Product Scraper[/dim]",
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
    
    ACTOR_ID = "junglee/amazon-crawler"
    
    # Search configuration
    SEARCH_KEYWORD = "wireless earbuds"
    AMAZON_DOMAIN = "amazon.com"  # Can also use amazon.co.uk, amazon.de, etc.
    
    run_input = {
        # Search keywords
        "keyword": SEARCH_KEYWORD,
        
        # Amazon domain
        "domain": AMAZON_DOMAIN,
        
        # Number of products to scrape
        "maxItems": 10,
        
        # Categories to search (optional)
        # "categoryUrls": ["https://www.amazon.com/s?k=earbuds&rh=n%3A12097479011"],
        
        # Proxy settings
        "proxyConfiguration": {
            "useApifyProxy": True,
        },
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Search: [green]{SEARCH_KEYWORD}[/green]")
    console.print(f"  Domain: [green]{AMAZON_DOMAIN}[/green]")
    console.print(f"  Max Products: [green]{run_input['maxItems']}[/green]")
    
    # =========================================================================
    # Run the Actor
    # =========================================================================
    
    console.print("\n[bold cyan]Running the scraper...[/bold cyan]")
    console.print("  [dim]This may take 2-3 minutes[/dim]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Searching Amazon...", total=None)
        
        try:
            run = client.actor(ACTOR_ID).call(run_input=run_input)
            progress.update(task, description="[green]✓ Search completed!")
        except Exception as e:
            progress.update(task, description=f"[red]✗ Error: {e}")
            console.print(f"\n[red]Error details:[/red] {e}")
            sys.exit(1)
    
    # =========================================================================
    # Process Results
    # =========================================================================
    
    console.print("\n[bold cyan]Results:[/bold cyan]")
    
    dataset_id = run.get("defaultDatasetId")
    console.print(f"  Dataset ID: [green]{dataset_id}[/green]")
    
    dataset_client = client.dataset(dataset_id)
    items = list(dataset_client.iterate_items())
    
    console.print(f"  Products found: [green]{len(items)}[/green]")
    
    if items:
        # Products table
        table = Table(title=f"Amazon Products: '{SEARCH_KEYWORD}'", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Product", max_width=35)
        table.add_column("Price", style="green", justify="right", width=10)
        table.add_column("Rating", style="yellow", justify="center", width=8)
        table.add_column("Reviews", style="cyan", justify="right", width=8)
        
        for i, product in enumerate(items, 1):
            # Product title
            title = product.get("title", "Unknown")[:32]
            if len(product.get("title", "")) > 32:
                title += "..."
            
            # Price - handle various formats
            price = product.get("price", {})
            if isinstance(price, dict):
                price_str = price.get("value", price.get("raw", "N/A"))
                currency = price.get("currency", "$")
                if isinstance(price_str, (int, float)):
                    price_str = f"{currency}{price_str:.2f}"
            else:
                price_str = str(price) if price else "N/A"
            
            # Rating
            rating = product.get("stars", product.get("rating", "N/A"))
            if isinstance(rating, (int, float)):
                stars = "⭐" * int(rating)
                rating_str = f"{rating}"
            else:
                rating_str = str(rating)
            
            # Reviews count
            reviews = product.get("reviewsCount", product.get("reviews", 0))
            reviews_str = f"{reviews:,}" if isinstance(reviews, int) else str(reviews)
            
            table.add_row(str(i), title, price_str, rating_str, reviews_str)
        
        console.print("\n")
        console.print(table)
        
        # Price statistics
        prices = []
        for p in items:
            price = p.get("price", {})
            if isinstance(price, dict):
                val = price.get("value")
            else:
                val = price
            if isinstance(val, (int, float)):
                prices.append(val)
        
        if prices:
            console.print(f"\n[bold cyan]Price Analysis:[/bold cyan]")
            console.print(f"  Lowest: [green]${min(prices):.2f}[/green]")
            console.print(f"  Highest: [red]${max(prices):.2f}[/red]")
            console.print(f"  Average: [yellow]${sum(prices)/len(prices):.2f}[/yellow]")
        
        # Show first product in detail
        if items:
            console.print("\n[bold cyan]Sample Product Details:[/bold cyan]\n")
            
            first = items[0]
            
            # Basic info
            console.print(f"  [bold]Title:[/bold] {first.get('title', 'N/A')}")
            console.print(f"  [bold]ASIN:[/bold] {first.get('asin', 'N/A')}")
            console.print(f"  [bold]Brand:[/bold] {first.get('brand', 'N/A')}")
            
            # Price details
            price = first.get("price", {})
            if isinstance(price, dict):
                console.print(f"  [bold]Price:[/bold] {price.get('raw', price.get('value', 'N/A'))}")
                if price.get("before"):
                    console.print(f"  [bold]Original:[/bold] [dim]{price.get('before')}[/dim] (discounted)")
            
            # Rating and reviews
            console.print(f"\n  [bold]Rating:[/bold] {first.get('stars', 'N/A')} / 5")
            console.print(f"  [bold]Reviews:[/bold] {first.get('reviewsCount', 'N/A'):,}")
            
            # Availability
            availability = first.get("availability", first.get("inStock"))
            if availability:
                console.print(f"  [bold]Availability:[/bold] {availability}")
            
            # Prime
            is_prime = first.get("isPrime", first.get("prime"))
            if is_prime:
                console.print(f"  [bold]Prime:[/bold] ✓ Prime Eligible")
            
            # Features/bullets
            features = first.get("features", first.get("bullets", []))
            if features:
                console.print(f"\n  [bold]Key Features:[/bold]")
                for f in features[:3]:
                    console.print(f"    • {f[:60]}...")
            
            # URL
            url = first.get("url", first.get("link"))
            if url:
                console.print(f"\n  [bold]URL:[/bold] {url[:60]}...")
            
            # Images
            images = first.get("images", first.get("thumbnails", []))
            if images:
                console.print(f"  [bold]Images:[/bold] {len(images)} available")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Amazon Scraping Complete![/bold green]\n\n"
        f"Products found: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Data Extracted:[/bold]\n"
        f"  • Product titles and ASINs\n"
        f"  • Current and original prices\n"
        f"  • Ratings and review counts\n"
        f"  • Brand and category info\n"
        f"  • Prime eligibility\n"
        f"  • Product features/bullets\n"
        f"  • Image URLs\n\n"
        f"[bold]Use Cases:[/bold]\n"
        f"  • Price tracking and alerts\n"
        f"  • Competitor monitoring\n"
        f"  • Product research/sourcing\n"
        f"  • Market analysis\n\n"
        f"[dim]Export to CSV: df = pd.DataFrame(items)[/dim]",
        title="🎉 Amazon Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
