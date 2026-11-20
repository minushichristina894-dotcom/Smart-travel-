/**
 * Admin settings — JavaScript (load & update system settings)
 * HTML structure: src/html/admin-settings.html
 * CSS: src/index.css
 */

import { adminAPI } from '../services/api';

export async function loadAdminSettings() {
  const { data } = await adminAPI.getSettings();
  return data.settings || [];
}

export async function updateAdminSetting(key, value) {
  return adminAPI.updateSetting({ setting_key: key, setting_value: value });
}

/** Hook helper — load settings into React state */
export function fetchAdminSettingsForPage(setSettings) {
  loadAdminSettings().then(setSettings);
}
