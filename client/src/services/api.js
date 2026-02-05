import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000 // Add 10 second timeout
});

// ================= DEBUGGING INTERCEPTORS =================

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    // Log request details (except sensitive data)
    const logData = {
      method: config.method?.toUpperCase(),
      url: config.url,
      timestamp: new Date().toISOString(),
    };
    
    // Add headers info (excluding authorization for security)
    const headersCopy = { ...config.headers };
    if (headersCopy.Authorization) {
      headersCopy.Authorization = '[REDACTED]';
    }
    
    console.group(`📤 ${logData.method} ${logData.url}`);
    console.log('Timestamp:', logData.timestamp);
    console.log('Headers:', headersCopy);
    
    if (config.data && Object.keys(config.data).length > 0) {
      console.log('Request Data:', config.data);
    }
    console.groupEnd();
    
    return config;
  },
  (error) => {
    console.error('❌ Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
api.interceptors.response.use(
  (response) => {
    console.group(`📥 Response from ${response.config.url}`);
    console.log('Status:', response.status, response.statusText);
    console.log('Data:', response.data);
    console.groupEnd();
    
    return response;
  },
  (error) => {
    console.group(`❌ Error from ${error.config?.url || 'unknown'}`);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
      console.error('Response Headers:', error.response.headers);
      
      // Special handling for 401 (Unauthorized)
      if (error.response.status === 401) {
        console.warn('⚠️ Unauthorized! Redirecting to login...');
        // Optionally redirect to login page
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // window.location.href = '/login';
        }
      }
      
      // Special handling for 404
      if (error.response.status === 404) {
        console.warn('⚠️ Resource not found. Check the endpoint URL.');
      }
      
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
      console.error('Possible causes:');
      console.error('  1. Backend server is not running');
      console.error('  2. Network connectivity issue');
      console.error('  3. CORS problem');
      console.error('  4. Request timeout');
      
    } else {
      // Something happened in setting up the request
      console.error('Request setup error:', error.message);
    }
    
    console.error('Full error object:', error);
    console.groupEnd();
    
    // Return a standardized error object
    return Promise.reject({
      message: error.message,
      response: error.response,
      request: error.request,
      config: error.config,
      isAxiosError: true
    });
  }
);

// ================= API FUNCTIONS =================

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
  getAllEmployees: () => api.get('/staff'),
  updateEmployee: (id, data) => api.put(`/staff/${id}`, data),
  updateEmployeePassword: (id, data) => api.put(`/staff/${id}/password`, data),
  deleteEmployee: (id) => api.delete(`/staff/${id}`)
};

/* ================= CUSTOMERS APIs ================= */
export const customersAPI = {
  getAll: () => api.get('/customers'),
  getById: (id) => api.get(`/customers/${id}`),
  search: (query) => api.get(`/customers/search?search=${encodeURIComponent(query)}`),
  create: (customer) => api.post('/customers', customer),
  update: (id, customer) => api.put(`/customers/${id}`, customer),
  delete: (id) => api.delete(`/customers/${id}`),
  // Additional helper methods
  deleteWithForce: (id) => api.delete(`/customers/${id}/force`),
  getCustomerRecords: (id) => api.get(`/customers/${id}/records`)
};

/* ================= RECORDS APIs ================= */
export const recordsAPI = {
  getAll: () => api.get('/records'),
  getById: (id) => api.get(`/records/${id}`),
  create: (data) => api.post('/records', data),
  update: (id, data) => api.put(`/records/${id}`, data),
  delete: (id) => api.delete(`/records/${id}`),
  deleteAll: () => api.delete('/records/all/delete-all'),
  getStats: (params) => api.get('/records/stats/income', { params }),
  export: (params) => api.get('/records/export', { params }),
  // Additional helper methods
  getByCustomerId: (customerId) => api.get(`/records/customer/${customerId}`),
  getByDateRange: (startDate, endDate) => 
    api.get(`/records/date-range?start=${startDate}&end=${endDate}`)
};

/* ================= UTILITY FUNCTIONS ================= */
export const apiUtils = {
  // Test backend connection
  testConnection: () => api.get('/health'),
  
  // Check if backend is running
  ping: () => api.get('/ping'),
  
  // Get API status
  getStatus: () => api.get('/status'),
  
  // Clear all console logs
  clearLogs: () => {
    if (typeof console.clear === 'function') {
      console.clear();
    }
  },
  
  // Enable/disable logging
  setDebugMode: (enabled) => {
    if (enabled) {
      api.interceptors.request.use(
        (config) => {
          console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
          return config;
        }
      );
    }
  }
};

// ================= ERROR HANDLER =================
export const handleApiError = (error, context = 'API call') => {
  console.error(`❌ ${context} failed:`, error);
  
  let userMessage = 'An error occurred. Please try again.';
  let debugInfo = {};
  
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    debugInfo = { status, data };
    
    switch (status) {
      case 400:
        userMessage = data.error || 'Bad request. Please check your input.';
        break;
      case 401:
        userMessage = 'Session expired. Please login again.';
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        break;
      case 403:
        userMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        userMessage = 'The requested resource was not found.';
        break;
      case 409:
        userMessage = data.error || 'Conflict detected. Please check your data.';
        break;
      case 500:
        userMessage = 'Server error. Please try again later.';
        break;
      default:
        userMessage = data.error || `Error ${status}: ${data.message || 'Unknown error'}`;
    }
    
  } else if (error.request) {
    // No response received
    userMessage = 'Cannot connect to server. Please check your internet connection.';
    debugInfo = { type: 'no_response', message: error.message };
    
  } else {
    // Request setup error
    userMessage = `Request error: ${error.message}`;
    debugInfo = { type: 'setup_error', message: error.message };
  }
  
  // Log for debugging
  if (process.env.NODE_ENV === 'development') {
    console.debug('Error details:', { error, context, debugInfo });
  }
  
  return {
    success: false,
    message: userMessage,
    error: error,
    debug: debugInfo
  };
};

// ================= API TEST FUNCTION =================
export const testAllEndpoints = async () => {
  console.log('🧪 Testing all API endpoints...');
  
  const tests = [
    { name: 'Health Check', func: () => api.get('/health') },
    { name: 'Get Customers', func: () => customersAPI.getAll() },
    { name: 'Get Services', func: () => servicesAPI.getAll() },
    { name: 'Get Staff', func: () => staffAPI.getAllEmployees() },
    { name: 'Get Records', func: () => recordsAPI.getAll() },
  ];
  
  const results = [];
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await test.func();
      results.push({
        name: test.name,
        success: true,
        status: response.status,
        data: response.data
      });
      console.log(`✅ ${test.name}: Success`);
    } catch (error) {
      results.push({
        name: test.name,
        success: false,
        error: error.message,
        status: error.response?.status
      });
      console.log(`❌ ${test.name}: Failed - ${error.message}`);
    }
  }
  
  console.log('Test results:', results);
  return results;
};

export default api;