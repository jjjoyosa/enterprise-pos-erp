import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

// 1. Request Interceptor: Attach the access token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 2. Response Interceptor: Catch 401s and silently refresh
api.interceptors.response.use(
  (response) => response, // If request succeeds, just return it
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't already tried to retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
        const refreshToken = localStorage.getItem('erp_refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        // Ask backend for a new token
        const { data } = await axios.post('http://localhost:5000/api/v1/auth/refresh', {
          refreshToken,
        });

        // Save the new token
        localStorage.setItem('erp_token', data.token);

        // Update the failed request with the new token and try again
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        // If the refresh token is ALSO expired, force a hard logout
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_refresh_token');
        window.location.href = '/'; // Kick them back to the login screen
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);