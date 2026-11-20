/**
 * Payment page — JavaScript (validation + pay booking)
 * HTML structure: src/html/payment-page.html
 * CSS: src/index.css
 */

import { bookingAPI } from '../services/api';

export async function loadBookingById(id) {
  const { data } = await bookingAPI.getAll();
  const booking = (data.bookings || []).find((b) => b.id === parseInt(id, 10));
  if (!booking) throw new Error('Booking not found');
  return booking;
}

export function validatePaymentForm(form) {
  const errors = {};

  if (!form.card_name?.trim()) errors.card_name = 'Name on card is required.';
  if (!/^\d{16}$/.test((form.card_number || '').replace(/\D/g, ''))) {
    errors.card_number = 'Card number must be 16 digits.';
  }
  if (!form.expiry?.trim()) errors.expiry = 'Expiry date is required.';
  if (!/^\d{3,4}$/.test(form.cvv || '')) errors.cvv = 'CVV must be 3-4 digits.';
  if (!form.method) errors.method = 'Payment method is required.';

  return errors;
}

export function hasPaymentErrors(errors) {
  return Object.keys(errors).length > 0;
}

export async function payBooking(id, form) {
  const payload = {
    card_name: form.card_name.trim(),
    card_number: form.card_number.replace(/\D/g, ''),
    expiry: form.expiry.trim(),
    cvv: form.cvv,
    method: form.method,
  };
  const { data } = await bookingAPI.pay(id, payload);
  return data;
}

/** Hook helper — load booking for payment page */
export function fetchBookingForPayment(id, setBooking, setError, setLoading) {
  loadBookingById(id)
    .then(setBooking)
    .catch(() => setError('Booking not found.'))
    .finally(() => setLoading(false));
}
