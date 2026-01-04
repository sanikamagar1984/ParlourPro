import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

/* ================= AUTH APIs ================= */
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password })
};

/* ================= SERVICES APIs ================= */
export const servicesAPI = {
  getAll: () => api.get('/services'),
  getByCategory: (category) => api.get(`/services/category/${category}`),
  create: (service) => api.post('/services', service),
  update: (id, service) => api.put(`/services/${id}`, service),
  delete: (id) => api.delete(`/services/${id}`)
};

/* ================= STAFF APIs ================= */
export const staffAPI = {
  // ✅ FIXED: Get all employees from users table
  getAllEmployees: () => api.get('/staff'),
  
  // ✅ FIXED: Update employee details
  updateEmployee: (id, data) => api.put(`/staff/${id}`, data),
  
  // ✅ FIXED: Update employee password
  updateEmployeePassword: (id, data) => api.put(`/staff/${id}/password`, data),
  
  // ✅ FIXED: Delete employee
  deleteEmployee: (id) => api.delete(`/staff/${id}`)
};

/* ================= CUSTOMERS APIs ================= */
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customer) => api.post('/customers', customer),
  update: (id, customer) => api.put(`/customers/${id}`, customer),
  delete: (id) => api.delete(`/customers/${id}`)
};

/* ================= RECORDS APIs ================= */
export const recordsAPI = {
  getAll: () => api.get('/records'),
  create: (record) => api.post('/records', record),
  delete: (id) => api.delete(`/records/${id}`)
};

export default api;