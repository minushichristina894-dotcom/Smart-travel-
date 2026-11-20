/**
 * Destinations page — JavaScript (load & filter destinations)
 * HTML structure: src/html/destinations-page.html
 * CSS: src/index.css
 */

import { destinationAPI } from '../services/api';

export async function loadDestinations() {
  const { data } = await destinationAPI.getAll({ active: 'true' });
  return data.destinations || [];
}

export function filterDestinations(destinations, search) {
  const q = (search || '').toLowerCase();
  if (!q) return destinations;
  return destinations.filter(
    (d) =>
      d.name.toLowerCase().includes(q) ||
      d.country.toLowerCase().includes(q)
  );
}

/** Hook helper — load destinations into React state */
export function fetchDestinationsForPage(setDestinations, setLoading) {
  loadDestinations()
    .then(setDestinations)
    .finally(() => setLoading(false));
}
