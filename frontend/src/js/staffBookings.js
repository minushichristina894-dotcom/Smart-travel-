/**
 * Staff bookings — JavaScript (load & update booking status)
 * HTML structure: src/html/staff-bookings.html
 * CSS: src/index.css
 */

import { bookingAPI } from '../services/api';

export async function loadStaffBookings() {
  const { data } = await bookingAPI.getAll();
  return data.bookings || [];
}

export async function updateBookingStatus(id, status) {
  return bookingAPI.updateStatus(id, status);
}

export function filterBookingsByStatus(bookings, filter) {
  if (filter === 'all') return bookings;
  return bookings.filter((b) => b.status === filter);
}

export const STAFF_BOOKING_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

/** Hook helper — load staff bookings into React state */
export function fetchStaffBookingsForPage(setBookings, setLoading) {
  loadStaffBookings()
    .then(setBookings)
    .finally(() => setLoading(false));
}
