import axios from 'axios';

const API = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

API.interceptors.request.use((config) => {
  const url = config.url || '';
  const isPublicAuth = url.includes('/auth/login') || url.includes('/auth/register')
    || url.includes('/auth/verify-email') || url.includes('/auth/resend-verification');

  // Do not send old token on login/register (fixes first-attempt login failure)
  if (!isPublicAuth) {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (r) => r,
  (error) => {
    const url = error.config?.url || '';
    const path = window.location.pathname;
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
    const isPublicAuthPage = path.includes('/login') || path.includes('/register');

    if (error.response?.status === 401 && !isAuthRequest && !isPublicAuthPage) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyEmail: ({ email, code }) => API.post('/auth/verify-email', { email, code }),
  resendVerification: (email) => API.post('/auth/resend-verification', { email }),
  getMe: () => API.get('/auth/me'),
};

export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
    return API.put('/users/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const destinationAPI = {
  getAll: (params) => API.get('/destinations', { params }),
  getById: (id) => API.get(`/destinations/${id}`),
  create: (data) => API.post('/destinations', data),
  update: (id, data) => API.put(`/destinations/${id}`, data),
  delete: (id) => API.delete(`/destinations/${id}`),
};

export const activityAPI = {
  getAll: (params) => API.get('/activities', { params }),
  getById: (id) => API.get(`/activities/${id}`),
  create: (data) => API.post('/activities', data),
  update: (id, data) => API.put(`/activities/${id}`, data),
  delete: (id) => API.delete(`/activities/${id}`),
};

export const bookingAPI = {
  getAll: () => API.get('/bookings'),
  getUpcoming: () => API.get('/bookings/upcoming'),
  create: (data) => API.post('/bookings', data),
  cancel: (id) => API.put(`/bookings/${id}/cancel`),
  updateStatus: (id, status) => API.put(`/bookings/${id}/status`, { status }),
  pay: (id, data) => API.post(`/bookings/${id}/pay`, data),
  getReport: (id) => API.get(`/bookings/${id}/report`),
  sendReport: (id) => API.post(`/bookings/${id}/send-report`),
};

export const weatherAPI = {
  searchPlaces: (q) => API.get('/weather/places', { params: { q } }),
  analyze: (data) => API.post('/weather/analyze', data),
  downloadPdf: (data) => API.post('/weather/report-pdf', data, { responseType: 'blob' }),
  emailPdf: (data) => API.post('/weather/report-email', data),
  getCurrent: (id) => API.get(`/weather/current/${id}`),
  getLogs: () => API.get('/weather/logs'),
};

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getStaffStats: () => API.get('/admin/staff-stats'),
  getUsers: () => API.get('/admin/users'),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getStaff: () => API.get('/admin/staff'),
  createStaff: (data) => API.post('/admin/staff', data),
  updateStaff: (id, data) => API.put(`/admin/staff/${id}`, data),
  getCustomers: () => API.get('/admin/customers'),
  getSettings: () => API.get('/admin/settings'),
  updateSetting: (data) => API.put('/admin/settings', data),
};

export default API;
