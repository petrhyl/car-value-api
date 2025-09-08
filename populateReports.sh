#!/bin/bash

# Define the access token (replace with your actual token)
FIRST_USER_TOKEN="${1:-}"
SECOND_USER_TOKEN="${2:-}"
ADMIN_TOKEN="${3:-}"
if [ -z "$FIRST_USER_TOKEN" ] || [ -z "$SECOND_USER_TOKEN" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "Usage: $0 <first_user_token> <second_user_token> <admin_token>"
  exit 1
fi

# Define the array of JSON objects
declare -a reports=(
'{"price":32500,"make":"Skoda","model":"Kodiaq","year":2023,"latitude":51.1657,"longitude":10.4515,"mileage":8500}'
'{"price":27500,"make":"Volkswagen","model":"Touareg","year":2022,"latitude":35.6895,"longitude":139.6917,"mileage":12000}'
'{"price":27000,"make":"Volkswagen","model":"Golf","year":2022,"latitude":52.3676,"longitude":4.9041,"mileage":11000}'
'{"price":41000,"make":"Tesla","model":"Model Y","year":2024,"latitude":37.3382,"longitude":-121.8863,"mileage":2000}'
'{"price":23000,"make":"Renault","model":"Clio","year":2021,"latitude":45.7640,"longitude":4.8357,"mileage":14000}'
'{"price":39000,"make":"Audi","model":"A4","year":2025,"latitude":50.1109,"longitude":8.6821,"mileage":1000}'
'{"price":19500,"make":"Peugeot","model":"308","year":2020,"latitude":43.6047,"longitude":1.4442,"mileage":23000}'
'{"price":25500,"make":"Fiat","model":"500X","year":2022,"latitude":41.9028,"longitude":12.4964,"mileage":9500}'
'{"price":30500,"make":"Volvo","model":"V60","year":2023,"latitude":59.9139,"longitude":10.7522,"mileage":7000}'
'{"price":36000,"make":"Hyundai","model":"Tucson","year":2024,"latitude":37.9838,"longitude":23.7275,"mileage":5000}'
'{"price":21000,"make":"Mazda","model":"Mazda3","year":2021,"latitude":35.6895,"longitude":139.6917,"mileage":17000}'
'{"price":28500,"make":"Renault","model":"Megane","year":2022,"latitude":34.0522,"longitude":-118.2437,"mileage":13000}'
'{"price":25000,"make":"Kia","model":"Ceed","year":2023,"latitude":55.7558,"longitude":37.6173,"mileage":8000}'
'{"price":33000,"make":"Mercedes-Benz","model":"GLA","year":2024,"latitude":48.8566,"longitude":2.3522,"mileage":4000}'
'{"price":22000,"make":"Opel","model":"Astra","year":2024,"latitude":53.3498,"longitude":-6.2603,"mileage":7000}'
)

# Loop through each report and send a POST request
for report in "${reports[@]}"; do
  curl -X POST http://localhost:3000/api/reports \
    -H "Authorization: Bearer $FIRST_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$report"

  echo "Report created"
done

echo "First part of reports have been sent."


declare -a another_reports=(
  '{"price":32000,"make":"Toyota","model":"Corolla","year":2023,"latitude":34.6937,"longitude":135.5023,"mileage":9000}'
'{"price":28000,"make":"Ford","model":"Focus","year":2022,"latitude":51.5074,"longitude":-0.1278,"mileage":12000}'
'{"price":35000,"make":"BMW","model":"3 Series","year":2024,"latitude":48.1351,"longitude":11.5820,"mileage":6000}'
'{"price":26000,"make":"Citroen","model":"C3","year":2021,"latitude":35.6762,"longitude":139.6503,"mileage":15000}'
'{"price":24000,"make":"Skoda","model":"Octavia","year":2022,"latitude":50.0755,"longitude":14.4378,"mileage":11000}'
'{"price":37000,"make":"Lexus","model":"UX","year":2023,"latitude":35.0116,"longitude":135.7681,"mileage":8000}'
'{"price":22000,"make":"Seat","model":"Leon","year":2021,"latitude":40.4168,"longitude":-3.7038,"mileage":16000}'
'{"price":29500,"make":"Subaru","model":"Impreza","year":2023,"latitude":35.6895,"longitude":139.6917,"mileage":9500}'
'{"price":31000,"make":"Toyota","model":"Camry","year":2022,"latitude":34.0522,"longitude":-118.2437,"mileage":10000}'
'{"price":27000,"make":"Citroen","model":"C4","year":2021,"latitude":48.8566,"longitude":2.3522,"mileage":14000}'
'{"price":34000,"make":"Jaguar","model":"XE","year":2024,"latitude":51.4545,"longitude":-2.5879,"mileage":5000}'
'{"price":23000,"make":"Hyundai","model":"i30","year":2022,"latitude":35.4437,"longitude":139.6380,"mileage":13000}'
'{"price":25500,"make":"BMW","model":"M5","year":2023,"latitude":41.8781,"longitude":-87.6298,"mileage":9000}'
'{"price":36000,"make":"Audi","model":"Q5","year":2024,"latitude":37.5665,"longitude":126.9780,"mileage":4000}'
'{"price":21000,"make":"Dacia","model":"Duster","year":2021,"latitude":44.4268,"longitude":26.1025,"mileage":17000}'
'{"price":30000,"make":"Mazda","model":"CX-5","year":2023,"latitude":52.5200,"longitude":13.4050,"mileage":7500}'
)

for report in "${another_reports[@]}"; do
  curl -X POST http://localhost:3000/api/reports \
    -H "Authorization: Bearer $SECOND_USER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "$report"

  echo "Report created"
done

echo "All reports have been sent."


for reportId in {1..33}; do
  curl -X PATCH http://localhost:3000/api/reports/$reportId/approval \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"approved":true}'

  echo "Report $reportId approved"
done

echo "All reports have been approved."