/**
 * Staff activity monitor — JavaScript (load activities & booking counts)
 * HTML structure: src/html/staff-activity-monitor.html
 * CSS: src/css/activities.css + src/index.css
 */

import { activityAPI, bookingAPI } from '../services/api';

export async function loadActivityMonitorData() {
  const [actRes, bookRes] = await Promise.all([
    activityAPI.getAll(),
    bookingAPI.getAll(),
  ]);
  return {
    activities: actRes.data.activities || [],
    bookings: bookRes.data.bookings || [],
  };
}

export function countActivityBookings(bookings, activityId) {
  return bookings.filter(
    (b) => b.activity_id === activityId && b.status !== 'cancelled'
  ).length;
}

/** Hook helper — load activity monitor data into React state */
export async function fetchActivityMonitorForPage(setActivities, setBookings, setLoading) {
  try {
    const { activities, bookings } = await loadActivityMonitorData();
    setActivities(activities);
    setBookings(bookings);
  } finally {
    setLoading(false);
  }
}
