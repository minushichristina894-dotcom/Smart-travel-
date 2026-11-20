/**
 * Admin staff — JavaScript (load staff & create staff form validation)
 * HTML structure: src/html/admin-staff.html
 * CSS: src/index.css
 */

import { adminAPI } from '../services/api';

export async function loadAdminStaff() {
  const { data } = await adminAPI.getStaff();
  return data.staff || [];
}

export async function createStaffMember(payload) {
  return adminAPI.createStaff(payload);
}

export function validateStaffForm(form) {
  const errors = {};

  if (!form.full_name?.trim()) errors.full_name = 'Full name is required.';
  if (form.username?.trim().length < 3) errors.username = 'Username must be at least 3 characters.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) errors.email = 'Valid email required.';
  if ((form.password || '').length < 6) errors.password = 'Minimum 6 characters.';

  return errors;
}

export function hasStaffErrors(errors) {
  return Object.keys(errors).length > 0;
}

export const DEFAULT_STAFF_FORM = {
  full_name: '',
  username: '',
  email: '',
  password: '',
  phone: '',
  department: 'Operations',
};

/** Hook helper — load staff list into React state */
export function fetchAdminStaffForPage(setStaff) {
  loadAdminStaff().then(setStaff);
}
