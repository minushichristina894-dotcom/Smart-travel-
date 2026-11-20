/**
 * Trip report page — JavaScript (load booking report)
 * HTML structure: src/html/trip-report-page.html
 * CSS: src/index.css
 */

import { bookingAPI } from '../services/api';

export async function loadTripReport(id) {
  const { data } = await bookingAPI.getReport(id);
  return data.report;
}

/** Hook helper — load trip report into React state */
export function fetchTripReportForPage(id, setReport, setError, setLoading) {
  loadTripReport(id)
    .then(setReport)
    .catch((err) => setError(err.response?.data?.message || 'Failed to load report.'))
    .finally(() => setLoading(false));
}

export async function sendTripReport(id) {
  return bookingAPI.sendReport(id);
}
