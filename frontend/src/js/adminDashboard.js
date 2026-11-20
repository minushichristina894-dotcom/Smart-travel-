/**
 * Admin dashboard — JavaScript (load admin stats)
 * HTML structure: src/html/admin-dashboard.html
 * CSS: src/index.css
 */

import { adminAPI } from '../services/api';

export async function loadAdminStats() {
  const { data } = await adminAPI.getStats();
  return data.stats;
}

export const ADMIN_STAT_LABELS = [
  { key: 'totalUsers', label: 'Total Users' },
  { key: 'totalStaff', label: 'Total Staff' },
  { key: 'totalDestinations', label: 'Destinations' },
  { key: 'totalActivities', label: 'Activities' },
  { key: 'totalBookings', label: 'Bookings' },
];

/** Hook helper — load admin stats into React state */
export function fetchAdminStatsForPage(setStats, setLoading) {
  loadAdminStats()
    .then(setStats)
    .finally(() => setLoading(false));
}
