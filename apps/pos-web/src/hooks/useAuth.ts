import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    
    mutationFn: async (credentials: { email: string; pinCode: string }) => {
      
      
      const payload = {
        email: credentials.email,
        pinCode: credentials.pinCode,
        password: credentials.pinCode 
      };

      const { data } = await api.post('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      
      localStorage.setItem('erp_token', data.token);
      
      
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      
      
      if (data.refreshToken) {
        localStorage.setItem('erp_refresh_token', data.refreshToken);
      } else {
        console.error("WARNING: Backend did not send a refreshToken!");
      }
      
      
      queryClient.clear(); 
      window.location.reload();
    }
  });
};

export const logout = () => {
  
  localStorage.removeItem('erp_token');
  localStorage.removeItem('erp_refresh_token'); 
  localStorage.removeItem('erp_user');
  window.location.reload(); 
};