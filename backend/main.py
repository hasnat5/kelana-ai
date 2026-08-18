from services.trip_service import calculate_daily_budget, get_trip_category, get_recommended_places, get_transportation_recommendation, get_travel_season
from fastapi import FastAPI
from pydantic import BaseModel


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    travel_style: str

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI!"}

@app.get("/health")
def home():
    return {"status": "OK"}


@app.post("/api/v1/trips")
def create_trip(request: TripRequest):
    daily_budget = calculate_daily_budget(request.budget, request.days)
    category = get_trip_category(request.budget)
    reccommended_transport = get_transportation_recommendation(category)

    return {
        "destination": request.destination,
        "days": request.days,
        "budget": request.budget,
        "daily_budget": daily_budget,
        "category": category,
        "recommended_transport": reccommended_transport,
    }

@app.get("/api/v1/transportations")
def get_transportation():
    return ["Bus", "Train", "Flight"]


@app.get("/api/v1/recommendations")
def get_recommendations():
    return ["Tokyo Tower", "Mount Fuji", "Shibuya"]

@app.get("/api/v1/trip-categories")
def get_trip_categories():
    return ["Backpacker", "Standard", "Luxury"]