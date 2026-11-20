/**
 * Admin users — JavaScript (load & delete customers)
 * HTML structure: src/html/admin-users.html
 * CSS: src/index.css
 */

import { adminAPI } from '../services/api';

export async function loadAdminUsers() {
  const { data } = await adminAPI.getUsers();
  return data.users || [];
}

export async function deleteAdminUser(id) {
  return adminAPI.deleteUser(id);
}

/** Hook helper — load users into React state */
export function fetchAdminUsersForPage(setUsers, setLoading) {
  loadAdminUsers()
    .then(setUsers)
    .finally(() => setLoading(false));
}
