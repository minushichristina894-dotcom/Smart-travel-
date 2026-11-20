/**
 * Activity details page — JavaScript (load single activity from API)
 * HTML structure: src/html/activity-details-page.html
 * CSS: src/css/activities.css + src/index.css
 */

import { activityAPI } from '../services/api';

export async function loadActivityById(id) {
  const { data } = await activityAPI.getById(id);
  return data.activity;
}

/** Hook helper — load activity into React state */
export function fetchActivityForPage(id, setActivity, setLoading) {
  loadActivityById(id)
    .then(setActivity)
    .catch(() => setActivity(null))
    .finally(() => setLoading(false));
}

export function getActivityBookingUrl(activity) {
  if (!activity) return '/booking';
  return `/booking?destination=${activity.destination_id}&activity=${activity.id}`;
}
