/**
 * Profile page — JavaScript (load & validate profile form)
 * HTML structure: src/html/profile-page.html
 * CSS: src/index.css
 */

import { userAPI } from '../services/api';

export async function loadProfile() {
  const { data } = await userAPI.getProfile();
  return data.user;
}

export async function updateProfile(payload) {
  const { data } = await userAPI.updateProfile(payload);
  return data.user;
}

export function validateProfileForm(form) {
  const errors = {};

  if (!form.full_name?.trim()) errors.full_name = 'Full name is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) errors.email = 'Valid email required.';
  if (!/^[0-9+\-\s]{9,15}$/.test(form.phone || '')) errors.phone = 'Valid phone number required.';
  if (form.password && form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }
  if (form.password && form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}

export function hasProfileErrors(errors) {
  return Object.keys(errors).length > 0;
}

export function buildProfilePayload(form) {
  const payload = {
    full_name: form.full_name.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
  };
  if (form.password) payload.password = form.password;
  return payload;
}

/** Hook helper — load profile into React state */
export function fetchProfileForPage(setForm) {
  loadProfile().then((user) => {
    setForm({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone,
      password: '',
      confirmPassword: '',
    });
  });
}
