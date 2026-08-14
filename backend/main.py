from services.trip_service import calculate_daily_budget, get_trip_category, get_recommended_places, get_transportation_recommendation, get_travel_season

# destination = input("Masukkan destinasi liburan yang diinginkan: ")
# country = input("Masukkan negara tujuan: ")
# days = int(input("Masukkan jumlah hari liburan: "))
# budget = float(input("Masukkan anggaran liburan (dalam USD): "))
# currency = input("Masukkan mata uang yang digunakan: ")
# travel_month = input("Masukkan bulan perjalanan (misalnya: Januari, Februari, dll.): ")

def print_destinations(destinations):
    print("Your Destinations")

    index = 0
    while index < len(destinations):
        print(f"{index + 1}. {destinations[index]}")
        index += 1

def print_recommended_places(destinations):
    print("Recommended Places")
    print()
    
    for destination in destinations:
        print(destination)

        for place in get_recommended_places(destination):
            print(f"- {place}")

        print()

def print_trip_summary(destinations, days, budget, month):
    daily_budget = calculate_daily_budget(budget, days)
    category = get_trip_category(budget)
    transportation = get_transportation_recommendation(category)
    season = get_travel_season(month)

    print("=========================")
    print("KelanaAI")
    print("=========================")
    print()
    print_destinations(destinations)
    print()
    print(f"Days: {days}")
    print(f"Budget: {budget} USD")
    print(f"Category: {category}")
    print(f"Daily Budget: {daily_budget:.0f} USD/day")
    print(f"Recommeded Transportation: {transportation}")
    print(f"Travel Month: {month}")
    print(f"Season: {season}")
    print()
    print_recommended_places(destinations)


print_trip_summary(["Japan"], 5,1500, "December")