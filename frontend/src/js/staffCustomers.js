/**
 * Staff customers — JavaScript (load customer list)
 * HTML structure: src/html/staff-customers.html
 * CSS: src/index.css
 */

import { adminAPI } from '../services/api';

export async function loadStaffCustomers() {
  const { data } = await adminAPI.getCustomers();
  return data.users || [];
}

/** Hook helper — load customers into React state */
export function fetchCustomersForPage(setUsers, setLoading) {
  loadStaffCustomers()
    .then(setUsers)
    .finally(() => setLoading(false));
}
