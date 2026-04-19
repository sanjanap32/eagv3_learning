"""
/Users/ashish/Documents/git_repository/eagv3_learning/travel_planner/main.py
"""
import argparse
import logging
from dotenv import load_dotenv
from rich.console import Console

from travel_planner.scraper import gather_context_for_query
from travel_planner.llm import generate_itinerary
from travel_planner.formatter import generate_markdown, print_itinerary_to_terminal, save_markdown

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger(__name__)

def main():
    parser = argparse.ArgumentParser(description="AI Travel Planner Generation")
    parser.add_argument("query", type=str, help="Travel related query (e.g., '5 days in Kyoto Japan itinerary')")
    parser.add_argument("--out", type=str, default="itinerary_output.md", help="Output markdown filename")
    
    args = parser.parse_args()
    
    # Load environment variables (API Key)
    load_dotenv()
    
    console = Console()
    console.print(f"[bold blue]Starting travel planning for:[/bold blue] {args.query}")
    
    # 1. Gather Context
    console.print("[yellow]Gathering context from web search...[/yellow]")
    context = gather_context_for_query(args.query)
    
    if not context.strip():
        logger.warning("No context gathered from web. Depending purely on LLM knowledge.")
        
    # 2. Query LLM
    console.print("[yellow]Generating itinerary with AI...[/yellow]")
    try:
        itinerary = generate_itinerary(args.query, context)
    except Exception as e:
        console.print(f"[bold red]Failed to generate itinerary:[/bold red] {e}")
        return

    # 3. Output formats
    console.print("\n[bold green]Success! Here is your generated itinerary:[/bold green]\n")
    print_itinerary_to_terminal(itinerary, console)
    
    md_output = generate_markdown(itinerary)
    save_markdown(md_output, args.out)
    
    console.print(f"\n[bold green]Check {args.out} for the Markdown export![/bold green]")

if __name__ == "__main__":
    main()
