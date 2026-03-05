import { useState } from 'react';
import { api } from '../services/api';

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (email: string, pinCode: string) => {
    setIsLoading(true);
    setError('');
    try {
      
      const { data } = await api.post('/auth/login', { email, pinCode });
      
      
      if (data.user?.role === 'CASHIER') {
        throw new Error('Unauthorized: Executive dashboard access restricted to Admins.');
      }

      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_refresh_token', data.refreshToken); 
      window.location.reload(); 
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