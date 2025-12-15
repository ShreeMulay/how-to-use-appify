#!/usr/bin/env python3
"""
01 - Hello World: Getting Started with Apify
=============================================

This script demonstrates the basics of using the Apify Python client:
- Setting up authentication
- Making your first API call
- Understanding the client structure

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed: pip install apify-client

Usage:
    python 01_hello_world.py

What you'll learn:
    - How to initialize the ApifyClient
    - How to get your user information
    - How to check your account status and plan
"""

import os
import sys
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

# Initialize Rich console for pretty output
console = Console()


def main():
    """Main function demonstrating Apify client basics."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]01 - Hello World: Getting Started[/dim]",
        border_style="blue"
    ))
    
    # =========================================================================
    # Step 1: Get API Token
    # =========================================================================
    console.print("\n[bold cyan]Step 1:[/bold cyan] Getting API Token...")
    
    api_token = os.environ.get("APIFY_API_TOKEN")
    
    if not api_token:
        console.print("[red]Error:[/red] APIFY_API_TOKEN environment variable not set!")
        console.print("\nTo set it:")
        console.print("  export APIFY_API_TOKEN='your_token_here'")
        console.print("\nGet your token from: https://console.apify.com/account/integrations")
        sys.exit(1)
    
    console.print(f"  Token found: {api_token[:20]}...{api_token[-4:]}")
    
    # =========================================================================
    # Step 2: Initialize the Client
    # =========================================================================
    console.print("\n[bold cyan]Step 2:[/bold cyan] Initializing ApifyClient...")
    
    from apify_client import ApifyClient
    
    client = ApifyClient(api_token)
    console.print("  [green]✓[/green] Client initialized successfully!")
    
    # =========================================================================
    # Step 3: Get User Information
    # =========================================================================
    console.print("\n[bold cyan]Step 3:[/bold cyan] Fetching user information...")
    
    try:
        # Get the current user info
        user_info = client.user("me").get()
        
        # Create a nice table for user info
        table = Table(title="Your Apify Account", show_header=True, header_style="bold magenta")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="green")
        
        table.add_row("Username", user_info.get("username", "N/A"))
        table.add_row("Email", user_info.get("email", "N/A"))
        table.add_row("User ID", user_info.get("id", "N/A"))
        
        # Profile info
        profile = user_info.get("profile", {})
        table.add_row("Name", profile.get("name", "Not set"))
        
        # Plan info
        plan = user_info.get("plan", {})
        table.add_row("Plan", plan.get("description", "Unknown"))
        table.add_row("Monthly Credits", f"${plan.get('monthlyUsageCreditsUsd', 0):.2f}")
        
        console.print(table)
        
    except Exception as e:
        console.print(f"[red]Error fetching user info:[/red] {e}")
        sys.exit(1)
    
    # =========================================================================
    # Step 4: List Some Actors
    # =========================================================================
    console.print("\n[bold cyan]Step 4:[/bold cyan] Listing available actors...")
    
    try:
        # List actors from the store (public actors)
        actors_client = client.actors()
        actor_list = actors_client.list(limit=5)
        
        if actor_list.items:
            table = Table(title="Sample Actors", show_header=True, header_style="bold magenta")
            table.add_column("Name", style="cyan")
            table.add_column("Username", style="dim")
            table.add_column("ID", style="green")
            
            for actor in actor_list.items[:5]:
                table.add_row(
                    actor.get("name", "Unknown"),
                    actor.get("username", "Unknown"),
                    actor.get("id", "Unknown")[:12] + "..."
                )
            
            console.print(table)
        else:
            console.print("  [yellow]No actors found in your account[/yellow]")
            
    except Exception as e:
        console.print(f"  [yellow]Note:[/yellow] Couldn't list actors: {e}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        "[bold green]Success![/bold green] You're connected to Apify.\n\n"
        "Next steps:\n"
        "  • Run [cyan]02_website_content_crawler.py[/cyan] to crawl a website\n"
        "  • Explore the Apify Store at https://apify.com/store\n"
        "  • Check the API docs at https://docs.apify.com/api/v2",
        title="🎉 Hello World Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
