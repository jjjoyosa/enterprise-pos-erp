import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('erp_token');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});