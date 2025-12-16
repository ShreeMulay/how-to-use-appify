#!/usr/bin/env python3
"""
07 - Twitter/X Scraper
======================

This script demonstrates how to use the Twitter Scraper actor
to extract tweets, profiles, and search results from Twitter/X.

Perfect for:
    - Social listening
    - Sentiment analysis
    - Brand monitoring
    - News tracking
    - Research data collection

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 07_twitter_scraper.py

What you'll learn:
    - How to search tweets by keyword
    - How to scrape user profiles
    - How to extract engagement metrics
    - Working with Twitter data
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn
from datetime import datetime

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
    """Demonstrate the Twitter Scraper actor."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]07 - Twitter/X Scraper[/dim]",
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
    
    ACTOR_ID = "apidojo/twitter-scraper-lite"
    
    # Search query - supports Twitter search operators
    SEARCH_QUERY = "artificial intelligence"
    
    run_input = {
        # Search queries
        "searchTerms": [SEARCH_QUERY],
        
        # Number of tweets to fetch
        "maxTweets": 20,
        
        # Search mode: "live" for recent, "top" for popular
        "searchMode": "live",
        
        # Additional filters
        "tweetLanguage": "en",
        
        # Include user profile data
        "addUserInfo": True,
    }
    
    console.print("\n[bold cyan]Configuration:[/bold cyan]")
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Search Query: [green]{SEARCH_QUERY}[/green]")
    console.print(f"  Max Tweets: [green]{run_input['maxTweets']}[/green]")
    console.print(f"  Mode: [green]{run_input['searchMode']}[/green]")
    
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
        task = progress.add_task("Searching Twitter...", total=None)
        
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
    
    console.print(f"  Tweets found: [green]{len(items)}[/green]")
    
    if items:
        # Tweets table
        table = Table(title=f"Tweets about '{SEARCH_QUERY}'", show_header=True, header_style="bold magenta")
        table.add_column("#", style="dim", width=3)
        table.add_column("Author", style="cyan", width=15)
        table.add_column("Tweet", max_width=35)
        table.add_column("❤️", style="red", justify="right", width=6)
        table.add_column("🔄", style="green", justify="right", width=6)
        table.add_column("💬", style="blue", justify="right", width=6)
        
        for i, tweet in enumerate(items[:15], 1):  # Show first 15
            # Get author info
            author = tweet.get("user", {})
            username = author.get("screen_name", tweet.get("author", "Unknown"))
            
            # Get tweet text
            text = tweet.get("full_text", tweet.get("text", ""))[:32]
            if len(tweet.get("full_text", tweet.get("text", ""))) > 32:
                text += "..."
            
            # Get engagement metrics
            likes = tweet.get("favorite_count", tweet.get("likes", 0))
            retweets = tweet.get("retweet_count", tweet.get("retweets", 0))
            replies = tweet.get("reply_count", tweet.get("replies", 0))
            
            table.add_row(
                str(i),
                f"@{username[:13]}",
                text or "[dim]No text[/dim]",
                format_number(likes),
                format_number(retweets),
                format_number(replies)
            )
        
        console.print("\n")
        console.print(table)
        
        # Calculate engagement stats
        total_likes = sum(t.get("favorite_count", t.get("likes", 0)) for t in items if isinstance(t.get("favorite_count", t.get("likes", 0)), int))
        total_retweets = sum(t.get("retweet_count", t.get("retweets", 0)) for t in items if isinstance(t.get("retweet_count", t.get("retweets", 0)), int))
        
        console.print(f"\n[bold cyan]Engagement Summary:[/bold cyan]")
        console.print(f"  Total Likes: [red]{format_number(total_likes)}[/red]")
        console.print(f"  Total Retweets: [green]{format_number(total_retweets)}[/green]")
        console.print(f"  Avg Engagement/Tweet: [yellow]{format_number((total_likes + total_retweets) // len(items) if items else 0)}[/yellow]")
        
        # Show first tweet in detail
        if items:
            console.print("\n[bold cyan]Sample Tweet Details:[/bold cyan]\n")
            
            first = items[0]
            
            # Author info
            author = first.get("user", {})
            console.print(f"  [bold]Author:[/bold] @{author.get('screen_name', first.get('author', 'N/A'))}")
            console.print(f"  [bold]Name:[/bold] {author.get('name', 'N/A')}")
            console.print(f"  [bold]Followers:[/bold] {format_number(author.get('followers_count', 0))}")
            console.print(f"  [bold]Verified:[/bold] {'✓' if author.get('verified') else '✗'}")
            
            # Tweet content
            text = first.get("full_text", first.get("text", ""))
            if text:
                console.print(f"\n  [bold]Tweet:[/bold]")
                console.print(Panel(text, border_style="dim", width=60))
            
            # Engagement
            console.print(f"\n  [bold]Engagement:[/bold]")
            console.print(f"    ❤️ Likes: {format_number(first.get('favorite_count', 0))}")
            console.print(f"    🔄 Retweets: {format_number(first.get('retweet_count', 0))}")
            console.print(f"    💬 Replies: {format_number(first.get('reply_count', 0))}")
            console.print(f"    👁️ Views: {format_number(first.get('views_count', first.get('views', 'N/A')))}")
            
            # Timestamp
            created_at = first.get("created_at", first.get("timestamp", ""))
            if created_at:
                console.print(f"\n  [bold]Posted:[/bold] {created_at}")
            
            # URL
            tweet_id = first.get("id_str", first.get("id", ""))
            username = author.get("screen_name", "")
            if tweet_id and username:
                console.print(f"  [bold]URL:[/bold] https://twitter.com/{username}/status/{tweet_id}")
            
            # Hashtags and mentions
            entities = first.get("entities", {})
            hashtags = entities.get("hashtags", [])
            if hashtags:
                tags = [h.get("text", "") for h in hashtags]
                console.print(f"\n  [bold]Hashtags:[/bold] {' '.join(['#' + t for t in tags if t])}")
            
            mentions = entities.get("user_mentions", [])
            if mentions:
                users = [m.get("screen_name", "") for m in mentions]
                console.print(f"  [bold]Mentions:[/bold] {' '.join(['@' + u for u in users if u])}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Twitter Scraping Complete![/bold green]\n\n"
        f"Tweets found: {len(items)}\n"
        f"Dataset ID: {dataset_id}\n\n"
        f"[bold]Data Extracted:[/bold]\n"
        f"  • Tweet text and media URLs\n"
        f"  • Likes, retweets, replies, views\n"
        f"  • Author profiles and follower counts\n"
        f"  • Hashtags and mentions\n"
        f"  • Timestamps and tweet URLs\n\n"
        f"[bold]Search Tips:[/bold]\n"
        f"  • 'from:username' - tweets from user\n"
        f"  • '#hashtag' - tweets with hashtag\n"
        f"  • 'keyword filter:links' - with links\n"
        f"  • 'keyword -filter:retweets' - no RTs\n\n"
        f"[dim]Great for sentiment analysis and social listening![/dim]",
        title="🎉 Twitter Scraper Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
