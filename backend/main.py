destination = input("Masukkan destinasi liburan yang diinginkan: ")
country = input("Masukkan negara tujuan: ")
days = int(input("Masukkan jumlah hari liburan: "))
budget = float(input("Masukkan anggaran liburan (dalam USD): "))
currency = input("Masukkan mata uang yang digunakan: ")
travel_month = input("Masukkan bulan perjalanan (misalnya: Januari, Februari, dll.): ")

def print_trip_summary():
    print("=========================")
    print("KelanaAI")
    print("=========================")
    print(f"Destination: {destination}")
    print(f"Country: {country}")
    print(f"Days: {days}")
    print(f"Budget: {budget} {currency}")
    print(f"Travel Month: {travel_month}")

print_trip_summary()