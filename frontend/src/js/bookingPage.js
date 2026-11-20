/**
 * Booking page — JavaScript helpers
 * HTML structure: src/html/booking.html
 * CSS: src/index.css
 */

import { destinationAPI, activityAPI, weatherAPI, bookingAPI } from '../services/api';

export async function loadDestinations() {
  const { data } = await destinationAPI.getAll();
  return data.destinations || [];
}

export async function loadActivitiesByDestination(destinationId) {
  if (!destinationId) return [];
  const { data } = await activityAPI.getAll({ destination_id: destinationId });
  return data.activities || [];
}

export async function analyzeWeather(payload) {
  const { data } = await weatherAPI.analyze(payload);
  return data;
}

export async function createBooking(payload) {
  const { data } = await bookingAPI.create(payload);
  return data;
}
