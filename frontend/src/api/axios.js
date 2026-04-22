import axios from 'axios';
import { toast } from 'react-toastify';

// Base API instance
// CRA proxy in package.json forwards same-origin requests to backend.
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/',
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    // Don't show toast for 401s on login page (it's expected)
    if (!(error.config.url === '/users/login' && error.response?.status === 401)) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default api;
