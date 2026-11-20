/**
 * Landing page — JavaScript (load featured data from API)
 * HTML structure: src/html/landing-page.html
 * CSS: src/index.css
 */

import { destinationAPI, activityAPI } from '../services/api';

const FEATURED_DEST_LIMIT = 3;
const POPULAR_ACTIVITY_LIMIT = 4;

export async function loadFeaturedDestinations() {
  const { data } = await destinationAPI.getAll({ active: 'true' });
  return (data.destinations || []).slice(0, FEATURED_DEST_LIMIT);
}

export async function loadPopularActivities() {
  const { data } = await activityAPI.getAll();
  return (data.activities || []).slice(0, POPULAR_ACTIVITY_LIMIT);
}

export async function loadLandingPageData() {
  const [destinations, activities] = await Promise.all([
    loadFeaturedDestinations(),
    loadPopularActivities(),
  ]);
  return { destinations, activities };
}

/** Hook helper — load landing data into React state */
export function fetchLandingDataForPage(setDestinations, setActivities) {
  loadLandingPageData().then(({ destinations, activities }) => {
    setDestinations(destinations);
    setActivities(activities);
  });
}
