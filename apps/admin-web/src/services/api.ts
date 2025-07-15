import axios from 'axios';



const DEVELOPMENT_TENANT_ID = '6a13eea1a686547665c727de'; 

export const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-id': DEVELOPMENT_TENANT_ID
  }
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data?.error || error.message);
    return Promise.reject(error);
  }
);