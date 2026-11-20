/**
 * Admin activities — JavaScript helpers
 * HTML structure: src/html/admin-activities.html
 * CSS: src/index.css
 */

import { activityAPI, destinationAPI } from '../services/api';

export async function loadAdminActivities() {
  const { data } = await activityAPI.getAll();
  return data.activities || [];
}

export async function loadAdminDestinations() {
  const { data } = await destinationAPI.getAll();
  return data.destinations || [];
}

export async function createActivity(payload) {
  return activityAPI.create(payload);
}

export const AGE_CATEGORY_OPTIONS = [
  { value: 'Kids', label: 'Kids — Under 12 years' },
  { value: 'Adults', label: 'Adults — 18 years and above' },
  { value: 'All Ages', label: 'All Ages — Family friendly' },
];

export const DEFAULT_ACTIVITY_FORM = {
  destination_id: '',
  name: '',
  description: '',
  price: '',
  duration_hours: 2,
  image_url: '',
  age_category: 'All Ages',
};
