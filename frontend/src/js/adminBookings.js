/**
 * Admin bookings — JavaScript (load & update booking status)
 * HTML structure: src/html/admin-bookings.html
 * CSS: src/index.css
 */

import { bookingAPI } from '../services/api';

export async function loadAdminBookings() {
  const { data } = await bookingAPI.getAll();
  return data.bookings || [];
}

export async function updateAdminBookingStatus(id, status) {
  return bookingAPI.updateStatus(id, status);
}

export const ADMIN_BOOKING_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export const ADMIN_STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

/** Hook helper — load admin bookings into React state */
export function fetchAdminBookingsForPage(setBookings, setLoading) {
  loadAdminBookings()
    .then(setBookings)
    .finally(() => setLoading(false));
}
