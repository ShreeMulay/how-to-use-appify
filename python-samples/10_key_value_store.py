#!/usr/bin/env python3
"""
10 - Key-Value Store Operations
===============================

This script demonstrates how to work with Apify Key-Value Stores:
storing, retrieving, and managing persistent data.

Key-Value Stores are perfect for:
    - Storing configuration and state
    - Caching data between runs
    - Sharing data across actors
    - Storing files (images, PDFs, etc.)

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 10_key_value_store.py

What you'll learn:
    - How to create and delete stores
    - How to set and get values
    - Working with different content types
    - Managing store lifecycle
"""

import os
import sys
import json
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


def main():
    """Demonstrate Apify Key-Value Store operations."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]10 - Key-Value Store Operations[/dim]",
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
    # Step 1: List Existing Stores
    # =========================================================================
    
    console.print("\n[bold cyan]Step 1: List Existing Key-Value Stores[/bold cyan]")
    
    kv_stores = client.key_value_stores()
    existing = kv_stores.list(limit=5)
    
    console.print(f"  Found {existing.total} stores in your account")
    
    if existing.items:
        table = Table(title="Recent Key-Value Stores", show_header=True, header_style="bold magenta")
        table.add_column("Name", style="cyan")
        table.add_column("ID", style="dim")
        table.add_column("Modified", style="green")
        
        for store in existing.items[:5]:
            name = store.get("name") or "[unnamed]"
            table.add_row(
                name[:25],
                store.get("id", "")[:12] + "...",
                store.get("modifiedAt", "")[:10]
            )
        
        console.print(table)
    
    # =========================================================================
    # Step 2: Create a New Store
    # =========================================================================
    
    console.print("\n[bold cyan]Step 2: Create a New Key-Value Store[/bold cyan]")
    
    store_name = f"learning-lab-kvs-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    new_store = kv_stores.get_or_create(name=store_name)
    store_id = new_store.get("id")
    
    console.print(f"  [green]✓[/green] Created store: [cyan]{store_name}[/cyan]")
    console.print(f"    ID: {store_id}")
    
    # Get store client
    store = client.key_value_store(store_id)
    
    # =========================================================================
    # Step 3: Store Different Value Types
    # =========================================================================
    
    console.print("\n[bold cyan]Step 3: Store Different Value Types[/bold cyan]")
    
    # 3.1: Store JSON object
    console.print("\n  [bold]3.1: JSON Object[/bold]")
    config = {
        "version": "1.0.0",
        "environment": "development",
        "features": {
            "darkMode": True,
            "notifications": True,
            "autoSave": False
        },
        "limits": {
            "maxItems": 1000,
            "timeout": 30
        }
    }
    store.set_record("config", config)
    console.print(f"    [green]✓[/green] Stored 'config' (JSON object)")
    
    # 3.2: Store simple string
    console.print("\n  [bold]3.2: Simple String[/bold]")
    store.set_record("status", "active", content_type="text/plain")
    console.print(f"    [green]✓[/green] Stored 'status' (text/plain)")
    
    # 3.3: Store array/list
    console.print("\n  [bold]3.3: Array/List[/bold]")
    urls_to_scrape = [
        "https://example.com/page1",
        "https://example.com/page2",
        "https://example.com/page3",
    ]
    store.set_record("pending_urls", urls_to_scrape)
    console.print(f"    [green]✓[/green] Stored 'pending_urls' (JSON array)")
    
    # 3.4: Store state object
    console.print("\n  [bold]3.4: State Object[/bold]")
    run_state = {
        "lastRunAt": datetime.now().isoformat(),
        "itemsProcessed": 150,
        "errors": [],
        "currentPage": 5,
        "totalPages": 10
    }
    store.set_record("state", run_state)
    console.print(f"    [green]✓[/green] Stored 'state' (run state)")
    
    # 3.5: Store metadata
    console.print("\n  [bold]3.5: Metadata Object[/bold]")
    metadata = {
        "createdBy": "learning-lab",
        "purpose": "demonstration",
        "tags": ["demo", "tutorial", "python"]
    }
    store.set_record("metadata", metadata)
    console.print(f"    [green]✓[/green] Stored 'metadata'")
    
    # =========================================================================
    # Step 4: Retrieve Values
    # =========================================================================
    
    console.print("\n[bold cyan]Step 4: Retrieve Values[/bold cyan]")
    
    # Get JSON object
    console.print("\n  [bold]Retrieving 'config':[/bold]")
    config_value = store.get_record("config")
    if config_value:
        console.print(Panel(
            json.dumps(config_value.get("value"), indent=2),
            border_style="dim",
            title="config",
            width=50
        ))
    
    # Get simple value
    console.print("\n  [bold]Retrieving 'status':[/bold]")
    status_value = store.get_record("status")
    if status_value:
        console.print(f"    Value: [green]{status_value.get('value')}[/green]")
    
    # Get array
    console.print("\n  [bold]Retrieving 'pending_urls':[/bold]")
    urls_value = store.get_record("pending_urls")
    if urls_value:
        for url in urls_value.get("value", []):
            console.print(f"    • {url}")
    
    # =========================================================================
    # Step 5: List All Keys
    # =========================================================================
    
    console.print("\n[bold cyan]Step 5: List All Keys in Store[/bold cyan]")
    
    keys_response = store.list_keys()
    
    table = Table(title="Stored Keys", show_header=True, header_style="bold magenta")
    table.add_column("Key", style="cyan")
    table.add_column("Size", style="yellow", justify="right")
    
    for key_info in keys_response.items:
        table.add_row(
            key_info.get("key", ""),
            f"{key_info.get('size', 0)} bytes"
        )
    
    console.print(table)
    
    # =========================================================================
    # Step 6: Update a Value
    # =========================================================================
    
    console.print("\n[bold cyan]Step 6: Update a Value[/bold cyan]")
    
    # Update the state
    updated_state = {
        "lastRunAt": datetime.now().isoformat(),
        "itemsProcessed": 200,  # Updated!
        "errors": [],
        "currentPage": 10,      # Updated!
        "totalPages": 10
    }
    store.set_record("state", updated_state)
    console.print("  [green]✓[/green] Updated 'state' record")
    
    # Verify the update
    new_state = store.get_record("state")
    console.print(f"    Items processed: [yellow]{new_state.get('value', {}).get('itemsProcessed')}[/yellow]")
    console.print(f"    Current page: [yellow]{new_state.get('value', {}).get('currentPage')}[/yellow]")
    
    # =========================================================================
    # Step 7: Delete a Key
    # =========================================================================
    
    console.print("\n[bold cyan]Step 7: Delete a Key[/bold cyan]")
    
    # Delete the status key
    store.delete_record("status")
    console.print("  [green]✓[/green] Deleted 'status' record")
    
    # Verify deletion
    deleted_value = store.get_record("status")
    console.print(f"    Verification: {'Not found (deleted)' if deleted_value is None else 'Still exists'}")
    
    # =========================================================================
    # Step 8: Store Info
    # =========================================================================
    
    console.print("\n[bold cyan]Step 8: Store Information[/bold cyan]")
    
    info = store.get()
    
    console.print(f"  Name: [cyan]{info.get('name', 'N/A')}[/cyan]")
    console.print(f"  ID: {info.get('id')}")
    console.print(f"  Created: {info.get('createdAt', 'N/A')}")
    console.print(f"  Modified: {info.get('modifiedAt', 'N/A')}")
    console.print(f"  Accessed: {info.get('accessedAt', 'N/A')}")
    
    # =========================================================================
    # Clean Up (Keep for reference)
    # =========================================================================
    
    console.print("\n[bold cyan]Step 9: Clean Up[/bold cyan]")
    console.print(f"  Store: [cyan]{store_name}[/cyan]")
    console.print("  [dim]Keeping store for your reference.[/dim]")
    console.print(f"  View at: https://console.apify.com/storage/key-value-stores/{store_id}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Key-Value Store Operations Complete![/bold green]\n\n"
        f"Store: {store_name}\n"
        f"ID: {store_id}\n\n"
        f"[bold]Operations Covered:[/bold]\n"
        f"  • list() - List all stores\n"
        f"  • get_or_create() - Create named store\n"
        f"  • set_record() - Store values\n"
        f"  • get_record() - Retrieve values\n"
        f"  • list_keys() - List all keys\n"
        f"  • delete_record() - Remove a key\n"
        f"  • get() - Store metadata\n\n"
        f"[bold]Common Use Cases:[/bold]\n"
        f"  • Store run configuration\n"
        f"  • Persist state between runs\n"
        f"  • Cache expensive computations\n"
        f"  • Store files (images, CSVs)\n"
        f"  • Share data between actors",
        title="🎉 Key-Value Store Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
