"""
/Users/ashish/Documents/git_repository/eagv3_learning/travel_planner/models.py
"""
from typing import List
from pydantic import BaseModel, Field

class DayItinerary(BaseModel):
    """Represents a single day's itinerary."""
    day_number: int = Field(description="The day number in the itinerary")
    morning_activity: str = Field(description="Activities planned for the morning")
    afternoon_activity: str = Field(description="Activities planned for the afternoon")
    evening_activity: str = Field(description="Activities planned for the evening")
    recommended_restaurants: List[str] = Field(description="List of recommended restaurants with cuisine type")
    transport_tips: str = Field(description="Transport tips between locations for the day")
    estimated_costs: str = Field(description="Estimated costs in local currency for the day")
    insider_tips: str = Field(description="Insider tips sourced from the crawled pages")

class FinalItinerary(BaseModel):
    """Represents the complete generated itinerary."""
    title: str = Field(description="Catchy title for the itinerary")
    days: List[DayItinerary] = Field(description="Daily breakdown of the itinerary")
    overall_budget_estimate: str = Field(description="Overall estimated budget for the trip")
    general_insider_tips: List[str] = Field(description="General insider tips for the entire trip")
