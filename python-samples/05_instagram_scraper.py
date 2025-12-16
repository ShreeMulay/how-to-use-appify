#!/usr/bin/env python3
"""
05 - Instagram Scraper
======================

This script demonstrates how to use the Instagram Scraper actor
to extract posts, profiles, hashtags, and comments from Instagram.

Perfect for:
    - Social media monitoring
    - Influencer research
    - Hashtag analysis
    - Content aggregation
    - Competitor analysis

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 05_instagram_scraper.py

What you'll learn:
    - How to scrape Instagram profiles
    - How to extract posts and engagement metrics
    - How to search by hashtags
    - Rate limiting and best practices
    
Note: Instagram scraping should be done responsibly and in
accordance with Instagram's Terms of Service.
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()


def main():
    """Demonstrate the Instagram Scraper actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]05 - Instagram Scraper[/dim]",
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
    
    ACTOR_ID = "apify/instagram-scraper"
    
    # Choose what to scrape
    SCRAPE_TYPE = "posts"  # Options: posts, comments, details (profile)
    
    # Target profiles or hashtags
    TARGETS = [
        "https://www.instagram.com/natgeo/",  # National Geographic
    ]
    
    run_input = {
        # What to scrape
        "directUrls": TARGETS,
        
        # Type of content
        "resultsType": SCRAPE_TYPE,
        
        # Limits (keep low for demo - costs apply)
        "resultsLimit": 10,
        
        # Search settings (alternative to directUrls)
        # "search": "nature photography",
        # "searchType": "hashtag",  # or "user"
        # "searchLimit": 5,
        
        # Additional options
        "addParentData": True,
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Scrape Type: [green]{SCRAPE_TYPE}[/green]")
    console.print(f"  Targets: [green]{', '.join(TARGETS)}[/green]")
    console.print(f"  Results Limit: [green]{run_input['resultsLimit']}[/green]")
    
    # =========================================================================
    # Run the Actor
    # =========================================================================
    
    console.print("\n[bold cyan]Running the scraper...[/bold cyan]")
    console.print("  [dim]This may take 1-3 minutes[/dim]\n")
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        console=console,
    ) as progress:
        task = progress.add_task("Scraping Instagram...", total=None)
        
        try:
            run = client.actor(ACTOR_ID).call(run_input=run_input)
            progress.update(task, description="[green]✓ Scraping completed!")
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
    
    console.print(f"  Items scraped: [green]{len(items)}[/green]")
    
    if items:
        # Posts table
        table = Table(title="Instagram Posts", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Type", style="cyan", width=8)
        table.add_column("Caption", max_width=35)
        table.add_column("❤️ Likes", style="red", justify="right")
        table.add_column("💬 Comments", style="blue", justify="right")
        table.add_column("Date", style="dim", width=12)
        
        for i, post in enumerate(items, 1):
            post_type = post.get("type", "post")
            caption = post.get("caption", "")[:32]
            if len(post.get("caption", "")) > 32:
                caption += "..."
            
            likes = post.get("likesCount", post.get("likes", 0))
            comments = post.get("commentsCount", post.get("comments", 0))
            
            # Parse timestamp
            timestamp = post.get("timestamp", post.get("taken_at", ""))
            if timestamp:
                date_str = str(timestamp)[:10]
            else:
                date_str = "N/A"
            
            table.add_row(
                str(i),
                post_type,
                caption or "[dim]No caption[/dim]",
                f"{likes:,}" if isinstance(likes, int) else str(likes),
                f"{comments:,}" if isinstance(comments, int) else str(comments),
                date_str
            )
        
        console.print("\n")
        console.print(table)
        
        # Calculate engagement stats
        total_likes = sum(p.get("likesCount", p.get("likes", 0)) for p in items if isinstance(p.get("likesCount", p.get("likes", 0)), int))
        total_comments = sum(p.get("commentsCount", p.get("comments", 0)) for p in items if isinstance(p.get("commentsCount", p.get("comments", 0)), int))
        
        console.print(f"\n[bold cyan]Engagement Summary:[/bold cyan]")
        console.print(f"  Total Likes: [red]{total_likes:,}[/red]")
        console.print(f"  Total Comments: [blue]{total_comments:,}[/blue]")
        console.print(f"  Avg Likes/Post: [yellow]{total_likes // len(items) if items else 0:,}[/yellow]")
        
        # Show first post details
        if items:
            console.print("\n[bold cyan]Sample Post Details:[/bold cyan]\n")
            
            first = items[0]
            
            console.print(f"  [bold]Post URL:[/bold] {first.get('url', first.get('shortCode', 'N/A'))}")
            console.print(f"  [bold]Type:[/bold] {first.get('type', 'post')}")
            console.print(f"  [bold]Owner:[/bold] {first.get('ownerUsername', first.get('owner', {}).get('username', 'N/A'))}")
            
            caption = first.get("caption", "")
            if caption:
                preview = caption[:200] + "..." if len(caption) > 200 else caption
                console.print(f"\n  [bold]Caption:[/bold]")
                console.print(Panel(preview, border_style="dim", width=60))
            
            # Hashtags
            hashtags = first.get("hashtags", [])
            if hashtags:
                console.print(f"\n  [bold]Hashtags:[/bold] {' '.join(['#' + h for h in hashtags[:10]])}")
            
            # Location
            location = first.get("locationName", first.get("location", {}).get("name"))
            if location:
                console.print(f"  [bold]Location:[/bold] {location}")
            
            # Media
            media_url = first.get("displayUrl", first.get("image_url"))
            if media_url:
                console.print(f"  [bold]Media URL:[/bold] {media_url[:60]}...")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Instagram Scraping Complete![/bold green]\n\n"
        f"Posts scraped: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Data Extracted:[/bold]\n"
        f"  • Post URLs and types (image/video/carousel)\n"
        f"  • Captions and hashtags\n"
        f"  • Likes, comments, engagement\n"
        f"  • Timestamps and locations\n"
        f"  • Media URLs\n\n"
        f"[bold]Other Scrape Types:[/bold]\n"
        f"  • 'details' - Full profile info\n"
        f"  • 'comments' - Post comments\n"
        f"  • Search by hashtag or username\n\n"
        f"[dim]Note: Always respect rate limits and ToS[/dim]",
        title="🎉 Instagram Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
