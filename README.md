"""
/Users/ashish/Documents/git_repository/eagv3_learning/README.md
"""
# AI Travel Planner

A production-ready Python command-line project that acts as an expert travel AI. This tool accepts a travel-related query (e.g., "5 days in Kyoto Japan itinerary"), performs Google search queries, scrapes webpage content, and utilizes the Google Gemini Large Language Model (via structured outputs) to synthesize a highly detailed itinerary. 

## Features
- **Smart Web Scraping:** Gathers real-time context and insider tips using `googlesearch-python` and `requests`/`beautifulsoup4`.
- **Generative AI Itinerary:** Uses `gemini-2.5-flash` with Pydantic structured output.
- **Rich Terminal UI:** Outputs colorful and structured tables right to your terminal using `rich`.
- **Markdown Export:** Saves your customized itinerary as a complete Markdown file ready to be shared.
- **Production Quality:** Fully type-hinted code, rigorous error-handling, standardized logging, and PEP 8 compliant.

## Setup Instructions

1. **Install dependencies**
Ensure you are running Python 3.9+ and run:
`pip install -r requirements.txt`

2. **Environment Variables**
Create a `.env` file based on `.env.example` at the root of the project and insert your Gemini API Key.
`GEMINI_API_KEY="your_api_key_here"`

## Usage

Simply run the module in your terminal to start generating your custom itineraries:
```bash
python -m travel_planner.main "5 days in Kyoto Japan itinerary" --out kyoto_itinerary.md
```

## Structure
- `travel_planner/main.py`: Entry point for CLI arguments and overarching flow.
- `travel_planner/llm.py`: Logic regarding Gemini integration and prompt execution.
- `travel_planner/scraper.py`: Operations traversing the web to extract real-time constraints and tips.
- `travel_planner/models.py`: Strongly typed data schema bridging LLM outputs to Python context.
- `travel_planner/formatter.py`: Generates beautiful printouts for your terminal and files string arrays for `.md`.
