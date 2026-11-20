/**
 * Destination details page — JavaScript (load destination + activities)
 * HTML structure: src/html/destination-details-page.html
 * CSS: src/index.css
 */

import { destinationAPI } from '../services/api';

export async function loadDestinationDetails(id) {
  const { data } = await destinationAPI.getById(id);
  return {
    destination: data.destination,
    activities: data.activities || [],
  };
}

/** Hook helper — load destination details into React state */
export function fetchDestinationForPage(id, setDestination, setActivities, setLoading) {
  loadDestinationDetails(id)
    .then(({ destination, activities }) => {
      setDestination(destination);
      setActivities(activities);
    })
    .catch(() => setDestination(null))
    .finally(() => setLoading(false));
}

export function getDestinationGallery(destination) {
  if (!destination) return [];
  return [destination.image_url, ...(destination.gallery || [])].filter(Boolean);
}

export function getBookingUrl(destinationId) {
  return `/booking?destination=${destinationId}`;
}

export function getWeatherRiskUrl(destinationId) {
  return `/weather-risk?destination=${destinationId}`;
}
