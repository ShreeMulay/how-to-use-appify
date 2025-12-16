#!/usr/bin/env python3
"""
09 - Dataset Operations
=======================

This script demonstrates how to work with Apify Datasets:
creating, reading, updating, and managing data storage.

Datasets are Apify's primary storage for structured data,
similar to database tables or spreadsheets.

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 09_dataset_operations.py

What you'll learn:
    - How to create and delete datasets
    - How to push items to datasets
    - How to read and iterate over items
    - How to export data in various formats
    - Managing dataset lifecycle
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
    """Demonstrate Apify Dataset operations."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]09 - Dataset Operations[/dim]",
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
    # Step 1: List Existing Datasets
    # =========================================================================
    
    console.print("\n[bold cyan]Step 1: List Existing Datasets[/bold cyan]")
    
    datasets_client = client.datasets()
    existing = datasets_client.list(limit=5)
    
    console.print(f"  Found {existing.total} datasets in your account")
    
    if existing.items:
        table = Table(title="Recent Datasets", show_header=True, header_style="bold magenta")
        table.add_column("Name", style="cyan")
        table.add_column("ID", style="dim")
        table.add_column("Items", justify="right")
        table.add_column("Modified", style="green")
        
        for ds in existing.items[:5]:
            name = ds.get("name") or "[unnamed]"
            table.add_row(
                name[:20],
                ds.get("id", "")[:12] + "...",
                str(ds.get("itemCount", 0)),
                ds.get("modifiedAt", "")[:10]
            )
        
        console.print(table)
    
    # =========================================================================
    # Step 2: Create a New Dataset
    # =========================================================================
    
    console.print("\n[bold cyan]Step 2: Create a New Dataset[/bold cyan]")
    
    # Create a named dataset
    dataset_name = f"learning-lab-demo-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    new_dataset = datasets_client.get_or_create(name=dataset_name)
    dataset_id = new_dataset.get("id")
    
    console.print(f"  [green]✓[/green] Created dataset: [cyan]{dataset_name}[/cyan]")
    console.print(f"    ID: {dataset_id}")
    
    # =========================================================================
    # Step 3: Push Items to Dataset
    # =========================================================================
    
    console.print("\n[bold cyan]Step 3: Push Items to Dataset[/bold cyan]")
    
    # Sample data to store
    sample_items = [
        {
            "id": 1,
            "name": "Python Programming",
            "category": "Programming",
            "price": 29.99,
            "inStock": True,
            "tags": ["python", "coding", "beginner"]
        },
        {
            "id": 2,
            "name": "Data Science Handbook",
            "category": "Data Science",
            "price": 49.99,
            "inStock": True,
            "tags": ["data", "ml", "statistics"]
        },
        {
            "id": 3,
            "name": "Web Scraping Mastery",
            "category": "Web Development",
            "price": 34.99,
            "inStock": False,
            "tags": ["scraping", "automation", "apify"]
        },
        {
            "id": 4,
            "name": "API Design Patterns",
            "category": "Programming",
            "price": 39.99,
            "inStock": True,
            "tags": ["api", "rest", "design"]
        },
        {
            "id": 5,
            "name": "Machine Learning Basics",
            "category": "Data Science",
            "price": 54.99,
            "inStock": True,
            "tags": ["ml", "ai", "tensorflow"]
        }
    ]
    
    # Get the dataset client
    dataset = client.dataset(dataset_id)
    
    # Push items to the dataset
    dataset.push_items(sample_items)
    
    console.print(f"  [green]✓[/green] Pushed {len(sample_items)} items to dataset")
    
    # Show what we pushed
    table = Table(title="Items Pushed", show_header=True, header_style="bold magenta")
    table.add_column("ID", style="dim")
    table.add_column("Name", style="cyan")
    table.add_column("Category", style="green")
    table.add_column("Price", style="yellow", justify="right")
    table.add_column("In Stock", justify="center")
    
    for item in sample_items:
        table.add_row(
            str(item["id"]),
            item["name"],
            item["category"],
            f"${item['price']}",
            "✓" if item["inStock"] else "✗"
        )
    
    console.print(table)
    
    # =========================================================================
    # Step 4: Read Items from Dataset
    # =========================================================================
    
    console.print("\n[bold cyan]Step 4: Read Items from Dataset[/bold cyan]")
    
    # Method 1: List items with pagination
    console.print("\n  [bold]Method 1: List with pagination[/bold]")
    items_response = dataset.list_items(limit=3, offset=0)
    console.print(f"    Total items: {items_response.total}")
    console.print(f"    Retrieved: {items_response.count} (offset: {items_response.offset})")
    
    # Method 2: Iterate over all items
    console.print("\n  [bold]Method 2: Iterate all items[/bold]")
    all_items = list(dataset.iterate_items())
    console.print(f"    Iterated over {len(all_items)} items")
    
    # Method 3: Get items with specific fields
    console.print("\n  [bold]Method 3: Filter specific fields[/bold]")
    filtered = dataset.list_items(fields=["name", "price"])
    for item in filtered.items[:2]:
        console.print(f"    {item}")
    
    # =========================================================================
    # Step 5: Export Data
    # =========================================================================
    
    console.print("\n[bold cyan]Step 5: Export Data Formats[/bold cyan]")
    
    # Download as different formats
    console.print("  Available export formats:")
    console.print("    • JSON: dataset.download_items(item_format='json')")
    console.print("    • CSV:  dataset.download_items(item_format='csv')")
    console.print("    • XLSX: dataset.download_items(item_format='xlsx')")
    console.print("    • XML:  dataset.download_items(item_format='xml')")
    
    # Show JSON export example
    console.print("\n  [bold]JSON Export Sample:[/bold]")
    json_data = dataset.list_items(limit=2)
    console.print(Panel(
        json.dumps(json_data.items, indent=2),
        border_style="dim",
        title="First 2 items as JSON"
    ))
    
    # =========================================================================
    # Step 6: Dataset Statistics
    # =========================================================================
    
    console.print("\n[bold cyan]Step 6: Dataset Statistics[/bold cyan]")
    
    info = dataset.get()
    
    console.print(f"  Name: [cyan]{info.get('name', 'N/A')}[/cyan]")
    console.print(f"  ID: {info.get('id')}")
    console.print(f"  Item Count: [green]{info.get('itemCount', 0)}[/green]")
    console.print(f"  Created: {info.get('createdAt', 'N/A')}")
    console.print(f"  Modified: {info.get('modifiedAt', 'N/A')}")
    console.print(f"  Accessed: {info.get('accessedAt', 'N/A')}")
    
    # =========================================================================
    # Step 7: Clean Up (Optional)
    # =========================================================================
    
    console.print("\n[bold cyan]Step 7: Clean Up[/bold cyan]")
    
    # Ask whether to delete the demo dataset
    console.print(f"\n  Demo dataset: [cyan]{dataset_name}[/cyan]")
    console.print("  [yellow]Note:[/yellow] In real applications, you'd keep your datasets!")
    
    # For demo purposes, we'll delete it
    # Uncomment the next line to actually delete:
    # dataset.delete()
    console.print("  [dim]Keeping dataset for your reference.[/dim]")
    console.print(f"  View at: https://console.apify.com/storage/datasets/{dataset_id}")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Dataset Operations Complete![/bold green]\n\n"
        f"Dataset: {dataset_name}\n"
        f"ID: {dataset_id}\n"
        f"Items: {len(sample_items)}\n\n"
        f"[bold]Operations Covered:[/bold]\n"
        f"  • list() - List all datasets\n"
        f"  • get_or_create() - Create named dataset\n"
        f"  • push_items() - Add items\n"
        f"  • list_items() - Read with pagination\n"
        f"  • iterate_items() - Iterate all items\n"
        f"  • download_items() - Export to formats\n"
        f"  • get() - Dataset metadata\n"
        f"  • delete() - Remove dataset\n\n"
        f"[bold]Key Points:[/bold]\n"
        f"  • Datasets are append-only (no updates)\n"
        f"  • Items can be any JSON objects\n"
        f"  • Auto-cleanup after 7 days (unnamed)\n"
        f"  • Named datasets persist indefinitely",
        title="🎉 Dataset Operations Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
