/**
 * Activities page — JavaScript (load data from API)
 * HTML structure: src/html/activities.html
 * CSS: src/css/activities.css
 */

import { activityAPI } from '../services/api';

/** Fetch all activities from backend */
export async function loadActivities() {
  const { data } = await activityAPI.getAll();
  return data.activities || [];
}

/** Hook helper — load activities into React state */
export function fetchActivitiesForPage(setActivities, setLoading) {
  loadActivities()
    .then(setActivities)
    .finally(() => setLoading(false));
}
