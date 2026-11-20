/**
 * Weather risk page — JavaScript (search places & analyze risk)
 * HTML structure: src/html/weather-risk-page.html
 * CSS: src/css/index.css
 */

import { weatherAPI } from '../services/api';

export async function searchPlaces(query) {
  if (!query || query.trim().length < 2) return [];
  const { data } = await weatherAPI.searchPlaces(query.trim());
  return data.places || [];
}

export async function analyzeWeatherRisk(payload) {
  const { data } = await weatherAPI.analyze(payload);
  return data;
}

export function validateWeatherRiskForm(placeName, travelDate) {
  if (!placeName?.trim()) {
    return 'Please enter a place in Sri Lanka (e.g. Kandy, Ella, Jaffna).';
  }
  if (!travelDate) return 'Please select a travel date.';
  return '';
}

/** Debounced place search helper */
export function createPlaceSearchHandler(setSuggestions) {
  let timer;
  return (query) => {
    clearTimeout(timer);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    timer = setTimeout(() => {
      searchPlaces(query)
        .then(setSuggestions)
        .catch(() => setSuggestions([]));
    }, 300);
  };
}

export const RISK_THRESHOLDS = {
  high: 'Rain > 20mm OR Wind > 35 km/h',
  moderate: 'Rain 5-20mm OR Wind 20-35 km/h',
  safe: 'All conditions within safe ranges',
};
