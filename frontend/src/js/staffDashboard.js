/**
 * Staff dashboard — JavaScript (load staff stats & confirm bookings)
 * HTML structure: src/html/staff-dashboard.html
 * CSS: src/index.css
 */

import { adminAPI, bookingAPI } from '../services/api';

export async function loadStaffStats() {
  const { data } = await adminAPI.getStaffStats();
  return data.stats;
}

export async function confirmBooking(id) {
  return bookingAPI.updateStatus(id, 'confirmed');
}

export const STAFF_STAT_CARDS = [
  { key: 'todaysBookings', label: "Today's Trips", link: '/staff/bookings' },
  { key: 'pendingBookings', label: 'Pending (Needs Action)', link: '/staff/bookings' },
  { key: 'completedBookings', label: 'Completed', link: '/staff/bookings' },
  { key: 'weatherAlerts', label: 'Weather Alerts', link: '/staff/weather-alerts' },
];

/** Hook helper — load staff stats into React state */
export function fetchStaffStatsForPage(setStats, setLoading) {
  loadStaffStats()
    .then(setStats)
    .finally(() => setLoading(false));
}
