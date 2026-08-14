def calculate_daily_budget(budget, days):
    return budget / days

def get_trip_category(budget):
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
        return "Standard"
    else:
        return "Luxury"

def get_recommended_places(destination):
    reccomendations = {
        "Japan": ["Tokyo Tower", "Shibuya", "Mount Fuji"],
        "Bali": ["Ubud", "Kuta Beach", "Tanah Lot"],
        "Singapore": ["Marina Bay Sands", "Sentosa", "Gardens by the Bay"],
    }
    return reccomendations.get(destination, ["City Center", "Local Market", "Popular Landmark"])

def get_transportation_recommendation(category):
    if category.lower() == "backpacker":
        return "Bus"
    elif category.lower() == "standard":
        return "Train"
    else:
        return "Flight"

def get_travel_season(season):
    season = season.lower()
    if season == "december":
        return "Peak Season"
    elif season == "june":
        return "Holiday Season"
    else:
        return "Regular Season"

    