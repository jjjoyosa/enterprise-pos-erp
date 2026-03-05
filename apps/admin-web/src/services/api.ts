import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 

      try {
        const refreshToken = localStorage.getItem('erp_refresh_token');
        if (!refreshToken) throw new Error('No refresh token available');

        
        const { data } = await axios.post('http://localhost:5000/api/v1/auth/refresh', {
          refreshToken,
        });

        
        localStorage.setItem('erp_token', data.token);

        
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
        
      } catch (refreshError) {
        
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_refresh_token');
        window.location.href = '/'; 
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);