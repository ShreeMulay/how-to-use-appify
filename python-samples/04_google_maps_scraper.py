#!/usr/bin/env python3
"""
04 - Google Maps Scraper
========================

This script demonstrates how to use the Google Maps Scraper actor
to extract business listings, reviews, and location data.

Perfect for:
    - Lead generation
    - Market research
    - Competitive analysis
    - Building business directories

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 04_google_maps_scraper.py

What you'll learn:
    - How to search for businesses by location/keyword
    - How to extract business details and reviews
    - Working with geo-based data
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()


def main():
    """Demonstrate the Google Maps Scraper actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]04 - Google Maps Scraper[/dim]",
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
    
    ACTOR_ID = "compass/crawler-google-places"
    
    # Search configuration
    SEARCH_QUERY = "coffee shops"
    LOCATION = "San Francisco, CA"
    MAX_RESULTS = 10  # Keep low for demo (costs apply per result)
    
    run_input = {
        # Search terms - what kind of business to find
        "searchStringsArray": [SEARCH_QUERY],
        
        # Location to search in
        "locationQuery": LOCATION,
        
        # Maximum number of places to return
        "maxCrawledPlacesPerSearch": MAX_RESULTS,
        
        # What data to include
        "includeReviews": True,
        "maxReviews": 5,  # Reviews per place
        "includeImages": False,  # Keep costs down
        
        # Language settings
        "language": "en",
        
        # Scraper settings
        "maxConcurrency": 5,
    }
    
    console.print("\n[bold cyan]Search Configuration:[/bold cyan]")
    console.print(f"  Query: [green]{SEARCH_QUERY}[/green]")
    console.print(f"  Location: [green]{LOCATION}[/green]")
    console.print(f"  Max Results: [green]{MAX_RESULTS}[/green]")
    console.print(f"  Include Reviews: [green]Yes (up to 5 per place)[/green]")
    
    # =========================================================================
    # Run the Actor
    # =========================================================================
    
    console.print("\n[bold cyan]Running the scraper...[/bold cyan]")
    console.print("  [dim]This may take 2-3 minutes depending on result count[/dim]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Searching Google Maps...", total=None)
        
        try:
            run = client.actor(ACTOR_ID).call(run_input=run_input)
            progress.update(task, description="[green]✓ Search completed!")
        except Exception as e:
            progress.update(task, description=f"[red]✗ Error: {e}")
            console.print(f"\n[yellow]Note:[/yellow] This actor may require specific input format.")
            console.print(f"[red]Error details:[/red] {e}")
            sys.exit(1)
    
    # =========================================================================
    # Process Results
    # =========================================================================
    
    console.print("\n[bold cyan]Results:[/bold cyan]")
    
    dataset_id = run.get("defaultDatasetId")
    console.print(f"  Dataset ID: [green]{dataset_id}[/green]")
    
    dataset_client = client.dataset(dataset_id)
    items = list(dataset_client.iterate_items())
    
    console.print(f"  Businesses found: [green]{len(items)}[/green]")
    
    if items:
        # Business listings table
        table = Table(title=f"'{SEARCH_QUERY}' in {LOCATION}", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Name", style="cyan", max_width=25)
        table.add_column("Rating", style="yellow", justify="center")
        table.add_column("Reviews", style="green", justify="right")
        table.add_column("Address", style="dim", max_width=30)
        
        for i, place in enumerate(items, 1):
            name = place.get("title", place.get("name", "Unknown"))[:22]
            rating = place.get("totalScore", place.get("rating", "N/A"))
            reviews = place.get("reviewsCount", place.get("reviews", 0))
            address = place.get("address", place.get("street", "N/A"))[:27]
            
            # Format rating with stars
            if isinstance(rating, (int, float)):
                stars = "⭐" * int(rating)
                rating_str = f"{rating} {stars}"
            else:
                rating_str = str(rating)
            
            table.add_row(str(i), name, rating_str, str(reviews), address)
        
        console.print("\n")
        console.print(table)
        
        # Show detailed info for first result
        if items:
            console.print("\n[bold cyan]Detailed View (first result):[/bold cyan]\n")
            
            first = items[0]
            
            # Basic info
            console.print(f"  [bold]Name:[/bold] {first.get('title', first.get('name', 'N/A'))}")
            console.print(f"  [bold]Category:[/bold] {first.get('categoryName', first.get('category', 'N/A'))}")
            console.print(f"  [bold]Address:[/bold] {first.get('address', 'N/A')}")
            console.print(f"  [bold]Phone:[/bold] {first.get('phone', 'N/A')}")
            console.print(f"  [bold]Website:[/bold] {first.get('website', 'N/A')}")
            
            # Location
            location = first.get("location", {})
            if location:
                lat = location.get("lat", first.get("latitude", "N/A"))
                lng = location.get("lng", first.get("longitude", "N/A"))
                console.print(f"  [bold]Coordinates:[/bold] {lat}, {lng}")
            
            # Rating details
            rating = first.get("totalScore", first.get("rating"))
            reviews_count = first.get("reviewsCount", first.get("reviews", 0))
            if rating:
                console.print(f"  [bold]Rating:[/bold] {rating}/5 ({reviews_count} reviews)")
            
            # Opening hours
            hours = first.get("openingHours", first.get("hours", []))
            if hours:
                console.print(f"\n  [bold]Opening Hours:[/bold]")
                if isinstance(hours, list):
                    for h in hours[:3]:
                        if isinstance(h, dict):
                            console.print(f"    {h.get('day', '?')}: {h.get('hours', 'N/A')}")
                        else:
                            console.print(f"    {h}")
            
            # Sample reviews
            reviews = first.get("reviews", [])
            if reviews:
                console.print(f"\n  [bold]Sample Reviews:[/bold]")
                for review in reviews[:3]:
                    if isinstance(review, dict):
                        author = review.get("name", review.get("author", "Anonymous"))
                        text = review.get("text", review.get("review", ""))[:100]
                        stars = review.get("stars", review.get("rating", "?"))
                        console.print(f"    ⭐{stars} by {author}")
                        console.print(f"    [dim]\"{text}...\"[/dim]\n")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Google Maps Scraping Complete![/bold green]\n\n"
        f"Businesses found: {len(items)}\n"
        f"Location: {LOCATION}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Extracted Data Includes:[/bold]\n"
        f"  • Business name, category, address\n"
        f"  • Phone, website, coordinates\n"
        f"  • Ratings and review counts\n"
        f"  • Opening hours\n"
        f"  • Customer reviews\n\n"
        f"[dim]Tip: Export to CSV for lead generation!\n"
        f"Use pandas: df = pd.DataFrame(items)[/dim]",
        title="🎉 Google Maps Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
