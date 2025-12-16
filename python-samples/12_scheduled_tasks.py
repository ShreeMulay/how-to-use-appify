#!/usr/bin/env python3
"""
12 - Scheduled Tasks and Webhooks
=================================

This script demonstrates how to set up scheduled runs and webhooks
to automate your Apify workflows.

Scheduling is essential for:
    - Regular data collection
    - Automated monitoring
    - Building data pipelines
    - Triggering workflows on events

Prerequisites:
    - APIFY_API_TOKEN environment variable set
    - apify-client package installed

Usage:
    python 12_scheduled_tasks.py

What you'll learn:
    - How to create and manage schedules
    - Understanding cron expressions
    - How to set up webhooks
    - Building automated workflows
"""

import os
import sys
from datetime import datetime, timedelta
from rich.console import Console
from rich.panel import Panel
from rich.table import Table

console = Console()


def main():
    """Demonstrate Apify Scheduling and Webhooks."""
    
    console.print(Panel.fit(
        "[bold blue]Apify Learning Lab[/bold blue]\n"
        "[dim]12 - Scheduled Tasks and Webhooks[/dim]",
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
    # Step 1: List Existing Schedules
    # =========================================================================
    
    console.print("\n[bold cyan]Step 1: List Existing Schedules[/bold cyan]")
    
    schedules_client = client.schedules()
    existing = schedules_client.list(limit=10)
    
    console.print(f"  Found {existing.total} schedules in your account")
    
    if existing.items:
        table = Table(title="Existing Schedules", show_header=True, header_style="bold magenta")
        table.add_column("Name", style="cyan", max_width=25)
        table.add_column("Cron", style="yellow")
        table.add_column("Enabled", justify="center")
        table.add_column("Last Run", style="green")
        
        for schedule in existing.items[:5]:
            table.add_row(
                schedule.get("name", "Unnamed")[:22],
                schedule.get("cronExpression", "N/A"),
                "[green]✓[/green]" if schedule.get("isEnabled") else "[red]✗[/red]",
                (schedule.get("lastRunAt", "") or "Never")[:10]
            )
        
        console.print(table)
    else:
        console.print("  [dim]No schedules found[/dim]")
    
    # =========================================================================
    # Step 2: Understanding Cron Expressions
    # =========================================================================
    
    console.print("\n[bold cyan]Step 2: Understanding Cron Expressions[/bold cyan]")
    
    console.print("\n  Cron format: [yellow]minute hour day-of-month month day-of-week[/yellow]")
    console.print("\n  Examples:")
    
    cron_examples = [
        ("0 * * * *", "Every hour at minute 0"),
        ("0 9 * * *", "Every day at 9:00 AM"),
        ("0 9 * * 1-5", "Every weekday at 9:00 AM"),
        ("0 0 * * 0", "Every Sunday at midnight"),
        ("0 9,18 * * *", "Every day at 9 AM and 6 PM"),
        ("*/15 * * * *", "Every 15 minutes"),
        ("0 0 1 * *", "First day of every month"),
        ("0 0 * * 1", "Every Monday at midnight"),
    ]
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Cron Expression", style="yellow")
    table.add_column("Description", style="green")
    
    for cron, desc in cron_examples:
        table.add_row(cron, desc)
    
    console.print(table)
    
    # =========================================================================
    # Step 3: Create a Schedule (Demo)
    # =========================================================================
    
    console.print("\n[bold cyan]Step 3: Create a Schedule (Demo)[/bold cyan]")
    
    # Note: This creates an actual schedule - use carefully!
    schedule_name = f"learning-lab-demo-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    console.print("\n  [bold]Schedule Configuration:[/bold]")
    console.print(f"    Name: [cyan]{schedule_name}[/cyan]")
    console.print(f"    Cron: [yellow]0 9 * * 1[/yellow] (Every Monday at 9 AM)")
    console.print(f"    Actor: [green]apify/hello-world[/green]")
    console.print(f"    Enabled: [red]No[/red] (disabled for demo)")
    
    # Create the schedule
    console.print("\n  Creating schedule...")
    
    try:
        new_schedule = schedules_client.create(
            name=schedule_name,
            cron_expression="0 9 * * 1",  # Every Monday at 9 AM UTC
            is_enabled=False,  # Disabled for demo
            is_exclusive=False,
            actions=[{
                "type": "RUN_ACTOR",
                "actorId": "apify/hello-world",
                "runInput": {
                    "message": f"Scheduled run from Learning Lab"
                },
                "runOptions": {
                    "memory": 256,
                    "timeout": 60
                }
            }]
        )
        
        schedule_id = new_schedule.get("id")
        console.print(f"  [green]✓[/green] Schedule created!")
        console.print(f"    ID: [cyan]{schedule_id}[/cyan]")
        
    except Exception as e:
        console.print(f"  [yellow]Note:[/yellow] Could not create schedule: {e}")
        schedule_id = None
    
    # =========================================================================
    # Step 4: Schedule Operations
    # =========================================================================
    
    console.print("\n[bold cyan]Step 4: Schedule Operations[/bold cyan]")
    
    console.print("\n  [bold]Available operations:[/bold]")
    console.print("    • schedules_client.create() - Create new schedule")
    console.print("    • schedule.update() - Modify schedule settings")
    console.print("    • schedule.get() - Get schedule details")
    console.print("    • schedule.delete() - Remove schedule")
    console.print("    • schedule.get_log() - View execution history")
    
    if schedule_id:
        schedule = client.schedule(schedule_id)
        info = schedule.get()
        
        console.print("\n  [bold]Schedule Details:[/bold]")
        console.print(f"    Name: {info.get('name')}")
        console.print(f"    Cron: {info.get('cronExpression')}")
        console.print(f"    Enabled: {info.get('isEnabled')}")
        console.print(f"    Timezone: {info.get('timezone', 'UTC')}")
        console.print(f"    Created: {info.get('createdAt', 'N/A')[:10]}")
        
        # Next run time
        next_run = info.get("nextRunAt")
        if next_run:
            console.print(f"    Next Run: {next_run}")
    
    # =========================================================================
    # Step 5: Understanding Webhooks
    # =========================================================================
    
    console.print("\n[bold cyan]Step 5: Understanding Webhooks[/bold cyan]")
    
    console.print("\n  Webhooks notify external services when events occur.")
    console.print("\n  [bold]Supported Events:[/bold]")
    
    webhook_events = [
        ("ACTOR.RUN.SUCCEEDED", "Actor run completed successfully"),
        ("ACTOR.RUN.FAILED", "Actor run failed"),
        ("ACTOR.RUN.ABORTED", "Actor run was aborted"),
        ("ACTOR.RUN.TIMED_OUT", "Actor run exceeded timeout"),
        ("ACTOR.RUN.CREATED", "New actor run was started"),
    ]
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Event", style="yellow")
    table.add_column("Description", style="green")
    
    for event, desc in webhook_events:
        table.add_row(event, desc)
    
    console.print(table)
    
    # =========================================================================
    # Step 6: Create a Webhook (Demo)
    # =========================================================================
    
    console.print("\n[bold cyan]Step 6: Create a Webhook (Demo)[/bold cyan]")
    
    console.print("\n  [bold]Example Webhook Configuration:[/bold]")
    console.print("    URL: https://webhook.site/your-unique-url")
    console.print("    Events: ACTOR.RUN.SUCCEEDED, ACTOR.RUN.FAILED")
    console.print("    Payload Template: Custom JSON")
    
    console.print("\n  [bold]Code example:[/bold]")
    console.print("""
    webhooks_client = client.webhooks()
    webhook = webhooks_client.create(
        request_url="https://your-server.com/webhook",
        event_types=["ACTOR.RUN.SUCCEEDED", "ACTOR.RUN.FAILED"],
        condition={
            "actorId": "your-actor-id"
        },
        payload_template='''{
            "event": {{eventType}},
            "actor": {{actorId}},
            "runId": {{runId}},
            "status": {{resource.status}},
            "data": {{resource.defaultDatasetId}}
        }'''
    )
    """)
    
    # =========================================================================
    # Step 7: Webhook Payload Template Variables
    # =========================================================================
    
    console.print("\n[bold cyan]Step 7: Webhook Payload Variables[/bold cyan]")
    
    console.print("\n  Available template variables:")
    
    variables = [
        ("{{eventType}}", "Type of event (e.g., ACTOR.RUN.SUCCEEDED)"),
        ("{{eventData}}", "Full event data object"),
        ("{{resource}}", "The affected resource (run, etc.)"),
        ("{{actorId}}", "ID of the actor"),
        ("{{actorRunId}}", "ID of the actor run"),
        ("{{userId}}", "Your user ID"),
        ("{{createdAt}}", "Event timestamp"),
    ]
    
    table = Table(show_header=True, header_style="bold magenta")
    table.add_column("Variable", style="yellow")
    table.add_column("Description", style="green")
    
    for var, desc in variables:
        table.add_row(var, desc)
    
    console.print(table)
    
    # =========================================================================
    # Step 8: Clean Up Demo Schedule
    # =========================================================================
    
    console.print("\n[bold cyan]Step 8: Clean Up[/bold cyan]")
    
    if schedule_id:
        console.print(f"\n  Demo schedule: [cyan]{schedule_name}[/cyan]")
        console.print("  [dim]Deleting demo schedule...[/dim]")
        
        try:
            schedule_to_delete = client.schedule(schedule_id)
            schedule_to_delete.delete()
            console.print("  [green]✓[/green] Demo schedule deleted")
        except Exception as e:
            console.print(f"  [yellow]Could not delete: {e}[/yellow]")
    
    # =========================================================================
    # Summary
    # =========================================================================
    
    console.print("\n" + "=" * 60)
    console.print(Panel.fit(
        f"[bold green]Scheduling & Webhooks Complete![/bold green]\n\n"
        f"[bold]Schedules:[/bold]\n"
        f"  • Create recurring runs with cron expressions\n"
        f"  • Run any actor or task on a schedule\n"
        f"  • Enable/disable without deleting\n"
        f"  • View execution history\n\n"
        f"[bold]Webhooks:[/bold]\n"
        f"  • Get notified on run completion\n"
        f"  • Trigger external workflows\n"
        f"  • Custom payload templates\n"
        f"  • Filter by actor/task\n\n"
        f"[bold]Common Patterns:[/bold]\n"
        f"  • Daily data collection at 9 AM\n"
        f"  • Hourly price monitoring\n"
        f"  • Weekly report generation\n"
        f"  • Slack notifications on failure\n"
        f"  • Database sync on success\n\n"
        f"[dim]Use the Apify Console for easy schedule setup![/dim]",
        title="🎉 Scheduling Complete",
        border_style="green"
    ))


if __name__ == "__main__":
    main()
