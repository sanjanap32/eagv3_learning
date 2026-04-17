"""
/Users/ashish/Documents/git_repository/eagv3_learning/travel_planner/llm.py
"""
import os
import logging
from google import genai
from travel_planner.models import FinalItinerary

logger = logging.getLogger(__name__)

def generate_itinerary(query: str, context: str) -> FinalItinerary:
    """
    Generate the travel itinerary using Gemini based on query and context.
    
    Args:
        query: User's travel query.
        context: Context gathered from web search.
        
    Returns:
        A complete FinalItinerary object.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_api_key_here":
        raise ValueError("GEMINI_API_KEY environment variable is not set correctly. Please configure your .env file.")
        
    client = genai.Client(api_key=api_key)
    
    system_prompt = (
        "You are an expert travel planning AI. "
        "Your task is to generate a complete, structured travel itinerary based on the user's query and the provided search context. "
        "Create a realistic and well-balanced itinerary. Integrate the 'insider tips' sourced from the context when available."
    )
    
    prompt = f"Query: {query}\\n\\nContext:\\n{context}"
    
    logger.info("Calling Gemini API...")
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=FinalItinerary,
                temperature=0.7,
            )
        )
        return response.parsed
    except Exception as e:
        logger.error(f"Error generating content via Gemini: {e}")
        raise
