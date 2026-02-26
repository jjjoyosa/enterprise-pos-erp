import { useState } from 'react';
import { api } from '../services/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email: string, pinCode: string) => {
    setIsLoading(true);
    setError('');
    try {
      // Assuming your auth controller uses this endpoint and payload
      const { data } = await api.post('/auth/login', { email, pinCode });
      
      // Strict RBAC: Only allow ADMIN (or MANAGER if you prefer) to access this dashboard
      if (data.user?.role === 'CASHIER') {
        throw new Error('Unauthorized: Executive dashboard access restricted to Admins.');
      }

      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_refresh_token', data.refreshToken); // Save the refresh token
      window.location.reload(); // Refresh to let App.tsx catch the token
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_token');
    window.location.reload();
  };

  return { login, logout, isLoading, error };
};