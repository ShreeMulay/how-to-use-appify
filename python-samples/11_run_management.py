#!/usr/bin/env python3
"""
11 - Run Management
===================

This script demonstrates how to manage and monitor actor runs:
starting, monitoring, aborting, and analyzing run results.

Understanding run management is crucial for:
    - Building reliable automation pipelines
    - Handling errors and retries
    - Monitoring long-running tasks
    - Optimizing costs and performance

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 11_run_management.py

What you'll learn:
    - How to start actor runs
    - How to monitor run status
    - How to handle run completion
    - How to abort and resurrect runs
    - Working with run logs and statistics
"""

import os
import sys
import time
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn
from rich.live import Live

console = Console()


def main():
    """Demonstrate Apify Run Management."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]11 - Run Management[/dim]",
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
    # Step 1: List Recent Runs
    # =========================================================================
    
    console.print("\n[bold cyan]Step 1: List Recent Runs[/bold cyan]")
    
    runs_client = client.runs()
    recent_runs = runs_client.list(limit=10)
    
    console.print(f"  Found {recent_runs.total} total runs in your account")
    
    if recent_runs.items:
        table = Table(title="Recent Runs", show_header=True, header_style="bold magenta")
        table.add_column("Status", style="bold", width=12)
        table.add_column("Actor", style="cyan", max_width=25)
        table.add_column("Run ID", style="dim", width=15)
        table.add_column("Duration", style="yellow", justify="right")
        table.add_column("Started", style="green")
        
        for run in recent_runs.items[:10]:
            # Status with color
            status = run.get("status", "UNKNOWN")
            if status == "SUCCEEDED":
                status_str = "[green]✓ SUCCEEDED[/green]"
            elif status == "RUNNING":
                status_str = "[yellow]● RUNNING[/yellow]"
            elif status == "FAILED":
                status_str = "[red]✗ FAILED[/red]"
            elif status == "ABORTED":
                status_str = "[dim]◼ ABORTED[/dim]"
            else:
                status_str = f"[dim]{status}[/dim]"
            
            # Duration
            stats = run.get("stats", {})
            duration_ms = stats.get("durationMillis", 0)
            if duration_ms:
                duration = f"{duration_ms / 1000:.1f}s"
            else:
                duration = "N/A"
            
            # Actor name (extract from actId)
            act_id = run.get("actId", "Unknown")
            
            table.add_row(
                status_str,
                act_id[:22] + "..." if len(act_id) > 22 else act_id,
                run.get("id", "")[:12] + "...",
                duration,
                run.get("startedAt", "")[:10]
            )
        
        console.print(table)
    
    # =========================================================================
    # Step 2: Start a New Run
    # =========================================================================
    
    console.print("\n[bold cyan]Step 2: Start a New Actor Run[/bold cyan]")
    
    # Use a simple, fast actor for demo
    ACTOR_ID = "apify/hello-world"
    
    run_input = {
        "message": "Hello from Python Learning Lab!"
    }
    
    console.print(f"  Actor: [green]{ACTOR_ID}[/green]")
    console.print(f"  Input: [yellow]{run_input}[/yellow]")
    
    # Start the run (non-blocking)
    actor_client = client.actor(ACTOR_ID)
    
    console.print("\n  Starting run...")
    run_info = actor_client.start(run_input=run_input)
    run_id = run_info.get("id")
    
    console.print(f"  [green]✓[/green] Run started!")
    console.print(f"    Run ID: [cyan]{run_id}[/cyan]")
    console.print(f"    Status: [yellow]{run_info.get('status')}[/yellow]")
    
    # =========================================================================
    # Step 3: Monitor Run Progress
    # =========================================================================
    
    console.print("\n[bold cyan]Step 3: Monitor Run Progress[/bold cyan]")
    
    run_client = client.run(run_id)
    
    console.print("  Polling for status updates...\n")
    
    max_wait = 60  # seconds
    poll_interval = 2
    elapsed = 0
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(),
        TextColumn("{task.percentage:>3.0f}%"),
        console=console,
    ) as progress:
        task = progress.add_task("Waiting for run to complete...", total=100)
        
        while elapsed < max_wait:
            # Get current status
            current_run = run_client.get()
            status = current_run.get("status")
            
            # Update progress
            progress.update(task, description=f"Status: {status}")
            
            if status in ["SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"]:
                progress.update(task, completed=100)
                break
            
            # Estimate progress based on time
            progress.update(task, completed=min(90, (elapsed / max_wait) * 100))
            
            time.sleep(poll_interval)
            elapsed += poll_interval
    
    # Get final run info
    final_run = run_client.get()
    
    console.print(f"\n  Final Status: ", end="")
    final_status = final_run.get("status")
    if final_status == "SUCCEEDED":
        console.print("[green]SUCCEEDED[/green]")
    elif final_status == "FAILED":
        console.print("[red]FAILED[/red]")
    else:
        console.print(f"[yellow]{final_status}[/yellow]")
    
    # =========================================================================
    # Step 4: Analyze Run Statistics
    # =========================================================================
    
    console.print("\n[bold cyan]Step 4: Analyze Run Statistics[/bold cyan]")
    
    stats = final_run.get("stats", {})
    options = final_run.get("options", {})
    usage = final_run.get("usage", {})
    
    console.print("\n  [bold]Run Configuration:[/bold]")
    console.print(f"    Memory: {options.get('memoryMbytes', 'N/A')} MB")
    console.print(f"    Timeout: {options.get('timeoutSecs', 'N/A')} seconds")
    console.print(f"    Build: {options.get('build', 'latest')}")
    
    console.print("\n  [bold]Run Statistics:[/bold]")
    console.print(f"    Duration: {stats.get('durationMillis', 0) / 1000:.2f} seconds")
    console.print(f"    Run Time: {stats.get('runTimeSecs', 0):.2f} seconds")
    console.print(f"    Input Size: {stats.get('inputBodyLen', 0)} bytes")
    console.print(f"    Restart Count: {stats.get('restartCount', 0)}")
    
    if usage:
        console.print("\n  [bold]Resource Usage:[/bold]")
        console.print(f"    Compute Units: {usage.get('ACTOR_COMPUTE_UNITS', 0):.4f}")
        console.print(f"    Dataset Reads: {usage.get('DATASET_READS', 0)}")
        console.print(f"    Dataset Writes: {usage.get('DATASET_WRITES', 0)}")
        console.print(f"    KV Store Reads: {usage.get('KEY_VALUE_STORE_READS', 0)}")
        console.print(f"    KV Store Writes: {usage.get('KEY_VALUE_STORE_WRITES', 0)}")
    
    # =========================================================================
    # Step 5: View Run Log
    # =========================================================================
    
    console.print("\n[bold cyan]Step 5: View Run Log[/bold cyan]")
    
    try:
        log = run_client.log().get()
        if log:
            # Show last 500 characters of log
            log_preview = log[-500:] if len(log) > 500 else log
            console.print(Panel(
                log_preview,
                title="Run Log (last 500 chars)",
                border_style="dim"
            ))
        else:
            console.print("  [dim]No log available[/dim]")
    except Exception as e:
        console.print(f"  [yellow]Could not fetch log: {e}[/yellow]")
    
    # =========================================================================
    # Step 6: Get Run Output
    # =========================================================================
    
    console.print("\n[bold cyan]Step 6: Get Run Output[/bold cyan]")
    
    # Get the default dataset
    dataset_id = final_run.get("defaultDatasetId")
    if dataset_id:
        dataset = client.dataset(dataset_id)
        items = list(dataset.iterate_items())
        
        console.print(f"  Dataset ID: [cyan]{dataset_id}[/cyan]")
        console.print(f"  Items in dataset: [green]{len(items)}[/green]")
        
        if items:
            console.print("\n  [bold]Output Data:[/bold]")
            for item in items[:3]:
                console.print(f"    {item}")
    
    # Get the default key-value store
    kv_store_id = final_run.get("defaultKeyValueStoreId")
    if kv_store_id:
        console.print(f"\n  Key-Value Store: [cyan]{kv_store_id}[/cyan]")
    
    # =========================================================================
    # Step 7: Run Management Operations
    # =========================================================================
    
    console.print("\n[bold cyan]Step 7: Run Management Operations[/bold cyan]")
    
    console.print("\n  [bold]Available operations:[/bold]")
    console.print("    • run_client.abort() - Stop a running actor")
    console.print("    • run_client.resurrect() - Restart a finished run")
    console.print("    • run_client.metamorph() - Transform into another actor")
    console.print("    • run_client.reboot() - Restart the container")
    
    console.print("\n  [bold]Example: Abort a run[/bold]")
    console.print("    [dim]# Start a long-running actor[/dim]")
    console.print("    [dim]run = actor_client.start(run_input={})[/dim]")
    console.print("    [dim]time.sleep(5)  # Wait a bit[/dim]")
    console.print("    [dim]client.run(run['id']).abort()  # Abort it[/dim]")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Run Management Complete![/bold green]\n\n"
        f"Run ID: {run_id}\n"
        f"Status: {final_status}\n"
        f"Duration: {stats.get('durationMillis', 0) / 1000:.2f}s\n\n"
        f"[bold]Operations Covered:[/bold]\n"
        f"  • list() - List all runs\n"
        f"  • start() - Start a new run\n"
        f"  • get() - Get run info\n"
        f"  • log().get() - Get run logs\n"
        f"  • abort() - Stop a run\n"
        f"  • resurrect() - Restart a run\n\n"
        f"[bold]Run Statuses:[/bold]\n"
        f"  • READY - Waiting to start\n"
        f"  • RUNNING - Currently executing\n"
        f"  • SUCCEEDED - Completed successfully\n"
        f"  • FAILED - Error occurred\n"
        f"  • ABORTED - Manually stopped\n"
        f"  • TIMED-OUT - Exceeded timeout",
        title="🎉 Run Management Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
