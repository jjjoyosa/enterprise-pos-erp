import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await api.post('/auth/login', credentials);
      return data;
    },
    onSuccess: (data) => {
      
      localStorage.setItem('erp_token', data.token);
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      window.location.reload();
      
      
      queryClient.clear(); 
    }
  });
};

export const logout = () => {
  localStorage.removeItem('erp_token');
  localStorage.removeItem('erp_user');
  window.location.reload(); 
};