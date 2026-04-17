"""
/Users/ashish/Documents/git_repository/eagv3_learning/travel_planner/formatter.py
"""
import logging
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from travel_planner.models import FinalItinerary

logger = logging.getLogger(__name__)

def generate_markdown(itinerary: FinalItinerary) -> str:
    """
    Format the structured itinerary into a Markdown string.
    """
    md = f"# {itinerary.title}\\n\\n"
    md += f"**Overall Budget Estimate**: {itinerary.overall_budget_estimate}\\n\\n"
    
    for day in itinerary.days:
        md += f"## Day {day.day_number}\\n\\n"
        md += f"**Morning**: {day.morning_activity}\\n\\n"
        md += f"**Afternoon**: {day.afternoon_activity}\\n\\n"
        md += f"**Evening**: {day.evening_activity}\\n\\n"
        
        md += "**Dining Recommendations**:\\n"
        for rest in day.recommended_restaurants:
            md += f"- {rest}\\n"
        md += "\\n"
        md += f"**Transport Tips**: {day.transport_tips}\\n\\n"
        md += f"**Estimated Cost**: {day.estimated_costs}\\n\\n"
        md += f"**Insider Tip**: {day.insider_tips}\\n\\n"
        md += "---\\n\\n"
        
    md += "## General Insider Tips\\n"
    for tip in itinerary.general_insider_tips:
        md += f"- {tip}\\n"
        
    return md

def print_itinerary_to_terminal(itinerary: FinalItinerary, console: Console):
    """
    Print the itinerary using Rich formatting nicely.
    """
    console.print(Panel(f"[bold cyan]{itinerary.title}[/bold cyan]", border_style="cyan"))
    console.print(f"[bold green]Overall Budget Estimate:[/bold green] {itinerary.overall_budget_estimate}\\n")
    
    for day in itinerary.days:
        table = Table(title=f"Day {day.day_number} Itinerary", show_header=True, header_style="bold magenta")
        table.add_column("Time / Category", style="dim", width=20)
        table.add_column("Details", style="white")
        
        table.add_row("Morning", day.morning_activity)
        table.add_row("Afternoon", day.afternoon_activity)
        table.add_row("Evening", day.evening_activity)
        table.add_row("Restaurants", ", ".join(day.recommended_restaurants))
        table.add_row("Transport", day.transport_tips)
        table.add_row("Estimated Cost", day.estimated_costs)
        table.add_row("Insider Tip", f"[italic yellow]{day.insider_tips}[/italic yellow]")
        
        console.print(table)
        console.print("")
        
    console.print("[bold cyan]General Insider Tips:[/bold cyan]")
    for tip in itinerary.general_insider_tips:
        console.print(f"- [italic]{tip}[/italic]")

def save_markdown(md_content: str, filename: str = "itinerary_output.md"):
    """
    Save the markdown content to a file.
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            f.write(md_content)
        logger.info(f"Successfully saved itinerary to {filename}")
    except Exception as e:
        logger.error(f"Failed to save Markdown: {e}")
