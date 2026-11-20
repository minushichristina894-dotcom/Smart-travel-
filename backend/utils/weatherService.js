const axios = require('axios');

const OWM_FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const OWM_CURRENT_URL = 'https://api.openweathermap.org/data/2.5/weather';

const getApiKey = () => {
  const key = process.env.OPENWEATHER_API_KEY?.trim();
  if (!key || key === 'your_openweathermap_api_key') return null;
  return key;
};

/** Demo weather when API key is not active yet (new keys take 1-2 hours) */
const getDemoWeather = (travelDate) => ({
  temperature: 26,
  rain_mm: 4,
  wind_speed_kmh: 16,
  humidity: 72,
  description: 'partly cloudy',
  icon: '02d',
  fetchedAt: new Date().toISOString(),
  isLive: false,
  source: 'Demo data — OpenWeather key still activating (wait 1-2 hrs for live data)',
  forecastDate: travelDate,
  provider: 'Demo fallback',
});

const handleOwmError = (error, travelDate) => {
  const status = error.response?.status;
  const owmMsg = error.response?.data?.message;

  if (status === 401) {
    console.warn('OpenWeather 401: API key not active yet. Using demo weather for presentation.');
    return getDemoWeather(travelDate);
  }

  if (status === 429) {
    throw new Error('OpenWeather rate limit reached. Please wait a few minutes and try again.');
  }

  throw new Error(owmMsg || error.message || 'Failed to fetch weather from OpenWeatherMap.');
};

/**
 * Parse OpenWeatherMap forecast/current item into standard weather object
 */
const parseOpenWeatherItem = (item, source, forecastDate = null) => {
  const rain_mm = item.rain?.['3h'] ?? item.rain?.['1h'] ?? 0;
  const wind_speed_kmh = Math.round((item.wind?.speed || 0) * 3.6 * 10) / 10;
  const temperature = Math.round((item.main?.temp ?? 20) * 10) / 10;
  const humidity = item.main?.humidity ?? 50;

  return {
    temperature,
    rain_mm: Math.round(rain_mm * 10) / 10,
    wind_speed_kmh,
    humidity,
    description: item.weather?.[0]?.description || 'unknown',
    icon: item.weather?.[0]?.icon || '01d',
    fetchedAt: item.dt_txt || new Date(item.dt * 1000).toISOString(),
    isLive: true,
    source,
    forecastDate,
    provider: 'OpenWeatherMap',
    raw: item,
  };
};

/**
 * Fetch real-time current weather from OpenWeatherMap API
 */
const fetchCurrentFromOpenWeather = async (lat, lon, travelDate) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured. Add your key to backend/.env');
  }

  try {
    const { data } = await axios.get(OWM_CURRENT_URL, {
      params: { lat, lon, appid: apiKey, units: 'metric' },
      timeout: 12000,
    });

    return {
      temperature: Math.round(data.main.temp * 10) / 10,
      rain_mm: data.rain?.['1h'] ?? 0,
      wind_speed_kmh: Math.round((data.wind?.speed || 0) * 3.6 * 10) / 10,
      humidity: data.main.humidity,
      description: data.weather?.[0]?.description || 'unknown',
      icon: data.weather?.[0]?.icon || '01d',
      fetchedAt: new Date(data.dt * 1000).toISOString(),
      isLive: true,
      source: 'OpenWeatherMap — Current Weather',
      provider: 'OpenWeatherMap',
      raw: data,
    };
  } catch (error) {
    const fallback = handleOwmError(error, travelDate);
    if (fallback) return fallback;
    throw error;
  }
};

/**
 * Fetch forecast for travel date from OpenWeatherMap 5-day/3-hour forecast API
 */
const fetchForecastFromOpenWeather = async (lat, lon, travelDate) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('OPENWEATHER_API_KEY is not configured. Add your key to backend/.env');
  }

  const targetDate = new Date(travelDate).toISOString().split('T')[0];
  const today = new Date().toISOString().split('T')[0];

  if (targetDate === today) {
    return fetchCurrentFromOpenWeather(lat, lon, travelDate);
  }

  const daysAhead = Math.ceil((new Date(targetDate) - new Date(today)) / (1000 * 60 * 60 * 24));
  if (daysAhead > 5) {
    throw new Error('OpenWeatherMap free forecast covers 5 days. Please choose a nearer travel date.');
  }

  try {
    const { data } = await axios.get(OWM_FORECAST_URL, {
      params: { lat, lon, appid: apiKey, units: 'metric' },
      timeout: 12000,
    });

    const forecasts = data.list || [];
    if (!forecasts.length) {
      throw new Error('No forecast data returned from OpenWeatherMap.');
    }

    const targetNoon = new Date(`${targetDate}T12:00:00`);
    let closest = forecasts[0];
    let minDiff = Infinity;

    for (const forecast of forecasts) {
      const forecastTime = new Date(forecast.dt_txt);
      const forecastDay = forecast.dt_txt.split(' ')[0];
      if (forecastDay !== targetDate) continue;

      const diff = Math.abs(forecastTime - targetNoon);
      if (diff < minDiff) {
        minDiff = diff;
        closest = forecast;
      }
    }

    if (closest.dt_txt.split(' ')[0] !== targetDate) {
      for (const forecast of forecasts) {
        const forecastDate = forecast.dt_txt.split(' ')[0];
        const diff = Math.abs(new Date(forecastDate) - new Date(targetDate));
        if (diff < minDiff) {
          minDiff = diff;
          closest = forecast;
        }
      }
    }

    return parseOpenWeatherItem(
      closest,
      'OpenWeatherMap — 5-Day Forecast',
      targetDate
    );
  } catch (error) {
    if (error.response?.status === 401) {
      return handleOwmError(error, travelDate);
    }
    if (error.message?.includes('5 days')) throw error;
    const fallback = handleOwmError(error, travelDate);
    if (fallback) return fallback;
    throw error;
  }
};

const fetchLiveWeather = async (lat, lon, travelDate) => {
  return fetchForecastFromOpenWeather(lat, lon, travelDate);
};

const fetchCurrentWeather = async (lat, lon) => {
  return fetchCurrentFromOpenWeather(lat, lon, new Date().toISOString().split('T')[0]);
};

module.exports = {
  fetchLiveWeather,
  fetchCurrentWeather,
  fetchWeatherForecast: fetchLiveWeather,
};
