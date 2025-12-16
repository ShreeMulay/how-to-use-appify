#!/usr/bin/env python3
"""
06 - TikTok Scraper
===================

This script demonstrates how to use the TikTok Scraper actor
to extract videos, profiles, and trending content from TikTok.

Perfect for:
    - Trend analysis
    - Influencer discovery
    - Content research
    - Viral content monitoring
    - Hashtag tracking

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 06_tiktok_scraper.py

What you'll learn:
    - How to scrape TikTok profiles
    - How to extract video metadata
    - How to search by hashtags
    - Understanding engagement metrics
    
Note: TikTok scraping should be done responsibly.
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()


def format_number(num):
    """Format large numbers with K/M suffix."""
    if not isinstance(num, (int, float)):
        return str(num)
    if num >= 1_000_000:
        return f"{num/1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num/1_000:.1f}K"
    return str(num)


def main():
    """Demonstrate the TikTok Scraper actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]06 - TikTok Scraper[/dim]",
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
    
    ACTOR_ID = "clockworks/free-tiktok-scraper"
    
    # Choose what to scrape
    PROFILES = ["tiktok"]  # Official TikTok account
    HASHTAGS = []  # e.g., ["fyp", "trending"]
    
    run_input = {
        # Profile usernames to scrape
        "profiles": PROFILES,
        
        # Hashtags to search
        "hashtags": HASHTAGS,
        
        # Number of results per profile/hashtag
        "resultsPerPage": 10,
        
        # Include additional data
        "shouldDownloadVideos": False,
        "shouldDownloadCovers": False,
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    if PROFILES:
        console.print(f"  Profiles: [green]{', '.join(PROFILES)}[/green]")
    if HASHTAGS:
        console.print(f"  Hashtags: [green]{', '.join(['#' + h for h in HASHTAGS])}[/green]")
    console.print(f"  Results Limit: [green]{run_input['resultsPerPage']}[/green]")
    
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
        task = progress.add_task("Scraping TikTok...", total=None)
        
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
    
    console.print(f"  Videos scraped: [green]{len(items)}[/green]")
    
    if items:
        # Videos table
        table = Table(title="TikTok Videos", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Description", max_width=30)
        table.add_column("👁️ Views", style="cyan", justify="right")
        table.add_column("❤️ Likes", style="red", justify="right")
        table.add_column("💬 Comments", style="blue", justify="right")
        table.add_column("🔄 Shares", style="green", justify="right")
        
        for i, video in enumerate(items, 1):
            desc = video.get("text", video.get("desc", ""))[:27]
            if len(video.get("text", video.get("desc", ""))) > 27:
                desc += "..."
            
            views = video.get("playCount", video.get("plays", 0))
            likes = video.get("diggCount", video.get("likes", 0))
            comments = video.get("commentCount", video.get("comments", 0))
            shares = video.get("shareCount", video.get("shares", 0))
            
            table.add_row(
                str(i),
                desc or "[dim]No description[/dim]",
                format_number(views),
                format_number(likes),
                format_number(comments),
                format_number(shares)
            )
        
        console.print("\n")
        console.print(table)
        
        # Calculate totals
        total_views = sum(v.get("playCount", v.get("plays", 0)) for v in items if isinstance(v.get("playCount", v.get("plays", 0)), int))
        total_likes = sum(v.get("diggCount", v.get("likes", 0)) for v in items if isinstance(v.get("diggCount", v.get("likes", 0)), int))
        
        console.print(f"\n[bold cyan]Performance Summary:[/bold cyan]")
        console.print(f"  Total Views: [cyan]{format_number(total_views)}[/cyan]")
        console.print(f"  Total Likes: [red]{format_number(total_likes)}[/red]")
        console.print(f"  Engagement Rate: [yellow]{(total_likes/total_views*100) if total_views else 0:.2f}%[/yellow]")
        
        # Show first video details
        if items:
            console.print("\n[bold cyan]Sample Video Details:[/bold cyan]\n")
            
            first = items[0]
            
            # Basic info
            console.print(f"  [bold]Video ID:[/bold] {first.get('id', 'N/A')}")
            console.print(f"  [bold]Author:[/bold] @{first.get('authorMeta', {}).get('name', first.get('author', 'N/A'))}")
            
            # Author stats
            author = first.get("authorMeta", {})
            if author:
                console.print(f"  [bold]Author Followers:[/bold] {format_number(author.get('fans', author.get('followers', 0)))}")
                console.print(f"  [bold]Author Verified:[/bold] {'✓' if author.get('verified') else '✗'}")
            
            # Description
            desc = first.get("text", first.get("desc", ""))
            if desc:
                preview = desc[:200] + "..." if len(desc) > 200 else desc
                console.print(f"\n  [bold]Description:[/bold]")
                console.print(Panel(preview, border_style="dim", width=60))
            
            # Hashtags
            hashtags = first.get("hashtags", [])
            if hashtags:
                if isinstance(hashtags[0], dict):
                    tags = [h.get("name", "") for h in hashtags[:10]]
                else:
                    tags = hashtags[:10]
                console.print(f"\n  [bold]Hashtags:[/bold] {' '.join(['#' + t for t in tags if t])}")
            
            # Music
            music = first.get("musicMeta", first.get("music", {}))
            if music:
                music_name = music.get("musicName", music.get("title", "N/A"))
                music_author = music.get("musicAuthor", music.get("author", "N/A"))
                console.print(f"\n  [bold]Music:[/bold] {music_name} by {music_author}")
            
            # Video info
            console.print(f"\n  [bold]Duration:[/bold] {first.get('videoMeta', {}).get('duration', first.get('duration', 'N/A'))}s")
            console.print(f"  [bold]Created:[/bold] {first.get('createTime', first.get('created', 'N/A'))}")
            
            # URL
            web_url = first.get("webVideoUrl", first.get("url"))
            if web_url:
                console.print(f"  [bold]URL:[/bold] {web_url}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]TikTok Scraping Complete![/bold green]\n\n"
        f"Videos scraped: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Data Extracted:[/bold]\n"
        f"  • Video descriptions and hashtags\n"
        f"  • Views, likes, comments, shares\n"
        f"  • Author info and follower counts\n"
        f"  • Music/sound information\n"
        f"  • Video URLs and duration\n\n"
        f"[bold]Other Options:[/bold]\n"
        f"  • Search by hashtag for trending content\n"
        f"  • Download video files (costs extra)\n"
        f"  • Extract comment threads\n\n"
        f"[dim]Great for trend analysis and influencer research![/dim]",
        title="🎉 TikTok Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
