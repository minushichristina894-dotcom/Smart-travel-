/**
 * My bookings page — JavaScript (load & cancel bookings)
 * HTML structure: src/html/my-bookings-page.html
 * CSS: src/index.css
 */

import { bookingAPI } from '../services/api';

export async function loadMyBookings() {
  const { data } = await bookingAPI.getAll();
  return data.bookings || [];
}

export async function cancelBooking(id) {
  return bookingAPI.cancel(id);
}

/** Hook helper — load bookings into React state */
export function fetchBookingsForPage(setBookings, setLoading) {
  loadMyBookings()
    .then(setBookings)
    .finally(() => setLoading(false));
}

export const BOOKING_STATUS_COLORS = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-blue-100 text-blue-700',
};

export const PAYMENT_STATUS_COLORS = {
  paid: 'bg-green-100 text-green-700',
  unpaid: 'bg-orange-100 text-orange-700',
  refunded: 'bg-gray-100 text-gray-700',
};
