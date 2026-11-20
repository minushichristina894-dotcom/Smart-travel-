/**
 * Register page — plain JavaScript (validation logic)
 */

export function validateRegisterForm(form) {
  const errors = {};

  if (!form.full_name?.trim()) errors.full_name = 'Full name is required';
  if (form.username?.trim().length < 3) errors.username = 'Username must be at least 3 characters';
  if (form.username?.trim().length > 50) errors.username = 'Username is too long (max 50 characters)';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email || '')) errors.email = 'Valid email required';
  if ((form.password || '').length < 6) errors.password = 'Minimum 6 characters';
  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  if (!/^[0-9+\-\s]{9,15}$/.test(form.phone || '')) errors.phone = 'Valid phone number required';

  return errors;
}

export function hasErrors(errors) {
  return Object.keys(errors).length > 0;
}
