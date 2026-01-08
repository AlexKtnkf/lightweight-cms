import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // For session cookies
});

// Add request interceptor to set Content-Type for JSON requests
api.interceptors.request.use(
  (config) => {
    // Only set Content-Type if it's not already set (for multipart/form-data)
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized (only if not already on login page)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
