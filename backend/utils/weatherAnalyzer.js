/**
 * Analyze weather data and determine travel risk level
 * @param {Object} weather - { rain_mm, wind_speed_kmh, temperature, humidity }
 * @returns {Object} { risk_level, recommendation, emoji }
 */
const analyzeWeatherRisk = (weather) => {
  const { rain_mm = 0, wind_speed_kmh = 0, temperature = 20, humidity = 50 } = weather;

  let risk_level = 'safe';
  let recommendation = 'Suitable for outdoor activities. Great weather for sightseeing and adventures!';

  // High Risk: Rain > 20mm OR Wind > 35 km/h
  if (rain_mm > 20 || wind_speed_kmh > 35) {
    risk_level = 'high';
    if (rain_mm > 20 && wind_speed_kmh > 35) {
      recommendation = 'Heavy rain and strong winds expected. Postpone your trip for safety.';
    } else if (rain_mm > 20) {
      recommendation = 'Heavy rain expected. Postpone your trip or plan indoor activities only.';
    } else {
      recommendation = 'Strong winds expected. Avoid outdoor activities and water sports.';
    }
  }
  // Moderate Risk: Rain 5-20mm OR Wind 20-35 km/h
  else if (
    (rain_mm >= 5 && rain_mm <= 20) ||
    (wind_speed_kmh >= 20 && wind_speed_kmh <= 35)
  ) {
    risk_level = 'moderate';
    if (rain_mm >= 5 && wind_speed_kmh >= 20) {
      recommendation = 'Light rain and moderate winds. Carry rain gear and plan flexible activities.';
    } else if (rain_mm >= 5) {
      recommendation = 'Light rain possible. Pack an umbrella and consider backup indoor plans.';
    } else {
      recommendation = 'Moderate winds expected. Be cautious with outdoor activities.';
    }
  }
  // Safe - additional temperature/humidity tips
  else {
    if (temperature > 35) {
      recommendation = 'Hot weather expected. Stay hydrated and avoid midday sun exposure.';
    } else if (temperature < 5) {
      recommendation = 'Cold weather expected. Pack warm clothing for comfortable travel.';
    } else if (humidity > 80) {
      recommendation = 'High humidity. Light clothing recommended for comfort.';
    }
  }

  return { risk_level, recommendation };
};

module.exports = { analyzeWeatherRisk };
