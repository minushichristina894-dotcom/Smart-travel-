const axios = require('axios');
const { fetchLiveWeather } = require('./weatherService');

const PYTHON_URL = process.env.PYTHON_WEATHER_URL || 'http://localhost:5001/api/analyze';

/**
 * Send weather data to Python Flask module for risk classification
 */
const analyzeWithPython = async (weather) => {
  const payload = {
    temperature: weather.temperature,
    rain_mm: weather.rain_mm,
    wind_speed_kmh: weather.wind_speed_kmh,
    humidity: weather.humidity,
    description: weather.description || '',
  };

  try {
    const { data } = await axios.post(PYTHON_URL, payload, { timeout: 10000 });
    if (!data?.analysis) throw new Error('Invalid response from Python module.');
    return data.analysis;
  } catch (error) {
    const refused = error.code === 'ECONNREFUSED' || error.cause?.code === 'ECONNREFUSED';
    if (refused) {
      throw new Error('Python weather module is not running. Open a terminal and run: cd python-service && python app.py');
    }
    throw new Error(error.response?.data?.message || error.message || 'Python weather analysis failed.');
  }
};

module.exports = { analyzeWithPython, fetchLiveWeather };
