/**
 * Flask Weather API — direct JSON connection (Axios)
 * Python Flask runs on port 5001 (backend/app.py)
 */
import axios from 'axios';

const flaskAPI = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: { 'Content-Type': 'application/json' },
});

/** POST weather data → get risk analysis JSON from Python Flask */
export async function analyzeWeatherWithFlask(weatherData) {
  const { data } = await flaskAPI.post('/analyze', weatherData);
  return data;
}

export async function checkFlaskHealth() {
  const { data } = await flaskAPI.get('/health');
  return data;
}

export default flaskAPI;
