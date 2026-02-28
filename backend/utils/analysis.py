import requests

WEATHER_URL = "https://api.open-meteo.com/v1/forecast"

lat = 40.6361  # Latitude
lon = 22.9375  # Longitude

def analyze_moisture(temp, humidity, moisture) -> bool:
    try:
        resp = requests.get(
            WEATHER_URL,
            params={
                "latitude":  lat,
                "longitude": lon,
                "hourly":    "precipitation_probability,precipitation",
                "forecast_days": 1,
                "timezone": "auto",
            },
            timeout=5,
        )
        resp.raise_for_status()
        data = resp.json().get("hourly", {})

        # Hourly precipitation > 0.2mm OR probability >= 60%
        precip   = data.get("precipitation", [])
        prob     = data.get("precipitation_probability", [])
        raining  = any(p > 0.2 for p in precip)
        rain_soon = any(p >= 60 for p in prob)

        if raining or rain_soon:
            return False
    except Exception:
        pass

    return True

def analyze_nutrients(Nlevel, Plevel, Klevel) -> str:
    if Nlevel < 10:
        return "Nitrogen low"
    elif Plevel < 5:
        return "Phosphorus low"
    elif Klevel < 5:
        return "Potassium low"
    else:
        return "Nutrients OK"