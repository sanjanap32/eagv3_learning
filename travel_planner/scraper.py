"""
/Users/ashish/Documents/git_repository/eagv3_learning/travel_planner/scraper.py
"""
import logging
from typing import List
import requests
from bs4 import BeautifulSoup
from googlesearch import search

logger = logging.getLogger(__name__)

def fetch_search_results(query: str, num_results: int = 3) -> List[str]:
    """
    Search Google and return top URLs.
    
    Args:
        query: The search query string.
        num_results: Number of top results to fetch.
        
    Returns:
        A list of URLs.
    """
    logger.info(f"Searching Google for: '{query}'")
    urls = []
    try:
        for url in search(query, num_results=num_results, advanced=False):
            urls.append(url)
            logger.debug(f"Found URL: {url}")
    except Exception as e:
        logger.error(f"Error executing search: {e}")
    return urls

def crawl_page_content(url: str, max_chars: int = 3000) -> str:
    """
    Crawl a webpage and extract its textual content.
    
    Args:
        url: The URL to crawl.
        max_chars: Maximum characters to return to avoid token overflow.
        
    Returns:
        The extracted text string or an empty string if failed.
    """
    logger.info(f"Crawling URL: {url}")
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Remove noisy elements
        for script in soup(["script", "style", "nav", "footer", "header"]):
            script.extract()
            
        text = soup.get_text(separator=' ', strip=True)
        # Truncate content to avoid blowing up the LLM context window
        if len(text) > max_chars:
            text = text[:max_chars] + "..."
            
        return text
    except Exception as e:
        logger.warning(f"Failed to crawl {url}: {e}")
        return ""

def gather_context_for_query(query: str) -> str:
    """
    Executes search and crawls the results, aggregating the text.
    
    Args:
        query: The user's query.
        
    Returns:
        Aggregated textual context string.
    """
    urls = fetch_search_results(query, num_results=3)
    context_chunks = []
    
    for url in urls:
        content = crawl_page_content(url)
        if content:
            context_chunks.append(f"Source: {url}\\nContent:\\n{content}")
            
    return "\\n\\n---\\n\\n".join(context_chunks)
