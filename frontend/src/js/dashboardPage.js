/**
 * Customer dashboard — JavaScript (load bookings, destinations, weather)
 * HTML structure: src/html/dashboard-page.html
 * CSS: src/index.css
 */

import { bookingAPI, destinationAPI, weatherAPI } from '../services/api';

export async function loadDashboardData() {
  const [upcomingRes, bookingsRes, destRes] = await Promise.all([
    bookingAPI.getUpcoming(),
    bookingAPI.getAll(),
    destinationAPI.getAll({ active: 'true' }),
  ]);

  const destinations = destRes.data.destinations || [];
  return {
    upcoming: upcomingRes.data.bookings || [],
    recentBookings: (bookingsRes.data.bookings || []).slice(0, 3),
    destinations: destinations.slice(0, 3),
    firstDestinationId: destinations[0]?.id || null,
  };
}

export async function loadLiveWeather(destinationId) {
  if (!destinationId) return null;
  const { data } = await weatherAPI.getCurrent(destinationId);
  // API shape: { destination, weather, analysis }
  const w = data.weather || {};
  return {
    destination_name: data.destination || 'Sri Lanka',
    temperature: Number(w.temperature),
    description: w.description || '',
    rain_mm: Number(w.rain_mm ?? 0),
    wind_speed_kmh: Number(w.wind_speed_kmh ?? 0),
    isLive: w.isLive !== false,
    risk_level: data.analysis?.risk_level || null,
    recommendation: data.analysis?.recommendation || null,
  };
}

/** Hook helper — load dashboard data into React state */
export async function fetchDashboardForPage({
  setUpcoming,
  setRecentBookings,
  setDestinations,
  setWeather,
  setLoading,
}) {
  try {
    const data = await loadDashboardData();
    setUpcoming(data.upcoming);
    setRecentBookings(data.recentBookings);
    setDestinations(data.destinations);

    if (data.firstDestinationId) {
      try {
        setWeather(await loadLiveWeather(data.firstDestinationId));
      } catch {
        setWeather(null);
      }
    }
  } finally {
    setLoading(false);
  }
}

export const WEATHER_REFRESH_MS = 5 * 60 * 1000;
