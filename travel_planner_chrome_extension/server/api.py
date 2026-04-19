import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS

# Add parent directory to access travel_planner
parent_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
sys.path.append(parent_dir)

from dotenv import load_dotenv
from travel_planner.scraper import gather_context_for_query
from travel_planner.llm import generate_itinerary
from travel_planner.formatter import generate_markdown

load_dotenv(os.path.join(parent_dir, '.env'))

app = Flask(__name__)
CORS(app)  # Allow Chrome Extension to make requests

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/plan_itinerary', methods=['POST'])
def plan_itinerary():
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({"error": "Missing 'query' parameter"}), 400
        
    query = data['query']
    logger.info(f"Received query from extension: {query}")
    
    try:
        # 1. Gather Context
        context = gather_context_for_query(query)
        
        # 2. Query LLM
        itinerary = generate_itinerary(query, context)
        
        # 3. Format Response as Markdown
        md_output = generate_markdown(itinerary)
        
        return jsonify({
            "status": "success",
            "markdown": md_output,
            "raw": itinerary.model_dump()
        })
    except Exception as e:
        logger.error(f"Error making itinerary: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Running on standard local port 5000
    app.run(port=5000, debug=True)
