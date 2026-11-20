"""
Weather Risk Analysis — Python Flask backend
Rules:
  Rain > 20mm OR Wind > 35 km/h  → HIGH RISK
  Rain 5-20mm OR Wind 20-35 km/h → MODERATE RISK
  Else                           → SAFE
"""


def build_recommendations(temperature, rain_mm, wind_speed_kmh, humidity, risk_level, description=''):
    tips = []
    desc = (description or '').lower()

    if risk_level == 'high':
        if rain_mm > 20:
            tips.append('Heavy rain expected — postpone outdoor trips and avoid hiking or beach activities.')
            tips.append('Roads in hill areas (Ella, Nuwara Eliya) may be slippery — travel not recommended.')
        if wind_speed_kmh > 35:
            tips.append('Strong winds expected — avoid boat rides, whale watching, and open highland areas.')
        if not tips:
            tips.append('Travel not recommended due to severe weather conditions.')
        return ' '.join(tips)

    if risk_level == 'moderate':
        if rain_mm >= 5:
            tips.append('Light to moderate rain expected — carry a raincoat or umbrella.')
            tips.append('Plan indoor backup activities such as temple visits or tea factory tours.')
        if wind_speed_kmh >= 20:
            tips.append('Moderate winds — be cautious near coastal and mountain viewpoints.')
        if humidity > 80:
            tips.append('High humidity — wear light breathable clothing.')
        if not tips:
            tips.append('Carry rain protection and monitor weather updates before departure.')
        return ' '.join(tips)

    tips.append('Suitable for travel and outdoor sightseeing.')

    if temperature >= 28:
        tips.append('Warm weather — stay hydrated, use sunscreen, and plan activities before midday heat.')
    elif temperature <= 18:
        tips.append('Cool conditions — ideal for hill country; pack a light jacket for evenings.')
    else:
        tips.append('Comfortable temperature for exploring destinations.')

    if humidity > 75:
        tips.append('Humid conditions — light cotton clothing recommended.')
    elif humidity < 50:
        tips.append('Low humidity — pleasant conditions for full-day tours.')

    if 0 < rain_mm < 5:
        tips.append('Brief showers possible — a compact umbrella is sufficient.')

    if 'clear' in desc or 'sun' in desc:
        tips.append('Great weather for beaches, Sigiriya climbs, and Nine Arch Bridge photography.')
    elif 'cloud' in desc:
        tips.append('Partly cloudy — good for sightseeing with occasional shade breaks.')

    if wind_speed_kmh < 15:
        tips.append('Calm winds — safe for whale watching in Mirissa and boat tours.')

    return ' '.join(tips)


def analyze_travel_risk(weather: dict) -> dict:
    temperature = float(weather.get('temperature', 20))
    rain_mm = float(weather.get('rain_mm', 0))
    wind_speed_kmh = float(weather.get('wind_speed_kmh', 0))
    humidity = int(weather.get('humidity', 50))
    description = weather.get('description', '')

    risk_level = 'safe'
    label = 'SAFE'

    if rain_mm > 20 or wind_speed_kmh > 35:
        risk_level = 'high'
        label = 'HIGH RISK'
    elif (5 <= rain_mm <= 20) or (20 <= wind_speed_kmh <= 35):
        risk_level = 'moderate'
        label = 'MODERATE RISK'

    recommendation = build_recommendations(
        temperature, rain_mm, wind_speed_kmh, humidity, risk_level, description
    )

    return {
        'risk_level': risk_level,
        'label': label,
        'recommendation': recommendation,
        'analyzed_by': 'Python Weather Decision Module v1.0',
        'data_source': 'OpenWeatherMap API',
        'input': {
            'temperature': temperature,
            'rain_mm': rain_mm,
            'wind_speed_kmh': wind_speed_kmh,
            'humidity': humidity,
            'description': description,
        },
    }
