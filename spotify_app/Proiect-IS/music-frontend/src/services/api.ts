import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // Point to Root
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // Check if the URL is NOT an auth endpoint before adding the token
    // This prevents sending tokens to /auth/login or /auth/register
    const isAuthRequest = config.url?.includes('/auth/');

    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;