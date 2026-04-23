const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8080';

export const appConfig = {
  apiBaseUrl: API_BASE_URL
};

