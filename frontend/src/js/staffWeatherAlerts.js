/**
 * Staff weather alerts — JavaScript (load weather logs)
 * HTML structure: src/html/staff-weather-alerts.html
 * CSS: src/index.css
 */

import { weatherAPI } from '../services/api';

export async function loadWeatherLogs() {
  const { data } = await weatherAPI.getLogs();
  return data.logs || [];
}

export function filterWeatherLogs(logs, filter) {
  if (filter === 'all') return logs;
  return logs.filter((l) => l.risk_level !== 'safe');
}

/** Hook helper — load weather logs into React state */
export function fetchWeatherLogsForPage(setLogs, setLoading) {
  loadWeatherLogs()
    .then(setLogs)
    .finally(() => setLoading(false));
}
