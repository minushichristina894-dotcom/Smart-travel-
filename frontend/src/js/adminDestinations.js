/**
 * Admin destinations — JavaScript (load, create, update, delete destinations)
 * HTML structure: src/html/admin-destinations.html
 * CSS: src/index.css
 */

import { destinationAPI } from '../services/api';

export async function loadAdminDestinations() {
  const { data } = await destinationAPI.getAll();
  return data.destinations || [];
}

export async function createDestination(payload) {
  return destinationAPI.create(payload);
}

export async function updateDestination(id, payload) {
  return destinationAPI.update(id, payload);
}

export async function deleteDestination(id) {
  return destinationAPI.delete(id);
}

export function validateDestinationForm(form) {
  const errors = {};

  if (!form.name?.trim()) errors.name = 'Name is required.';
  if (!form.country?.trim()) errors.country = 'Country is required.';
  if (!form.description?.trim()) errors.description = 'Description is required.';
  if (!form.image_url?.trim()) errors.image_url = 'Image URL is required.';
  if (!form.price || parseFloat(form.price) <= 0) errors.price = 'Valid price required.';

  return errors;
}

export function hasDestinationErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function buildDestinationPayload(form) {
  return {
    name: form.name.trim(),
    country: form.country.trim(),
    description: form.description.trim(),
    image_url: form.image_url.trim(),
    price: parseFloat(form.price),
    latitude: form.latitude ? parseFloat(form.latitude) : null,
    longitude: form.longitude ? parseFloat(form.longitude) : null,
    gallery: form.gallery
      ? form.gallery.split(',').map((s) => s.trim()).filter(Boolean)
      : [],
  };
}

export const EMPTY_DESTINATION_FORM = {
  name: '',
  country: '',
  description: '',
  image_url: '',
  price: '',
  latitude: '',
  longitude: '',
  gallery: '',
};

/** Hook helper — load destinations into React state */
export function fetchAdminDestinationsForPage(setDestinations, setLoading) {
  loadAdminDestinations()
    .then(setDestinations)
    .finally(() => setLoading(false));
}
