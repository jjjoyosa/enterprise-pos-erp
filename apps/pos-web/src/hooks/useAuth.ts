import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // 1. We strictly define that the POS form will send email and pinCode
    mutationFn: async (credentials: { email: string; pinCode: string }) => {
      
      // 2. We map it to satisfy the backend (sending pinCode as both fields just in case)
      const payload = {
        email: credentials.email,
        pinCode: credentials.pinCode,
        password: credentials.pinCode 
      };

      const { data } = await api.post('/auth/login', payload);
      return data;
    },
    onSuccess: (data) => {
      // 3. Save the main access token
      localStorage.setItem('erp_token', data.token);
      
      // 4. Save the cashier's profile
      localStorage.setItem('erp_user', JSON.stringify(data.user));
      
      // 5. CRITICAL: Save the refresh token so the register never locks mid-shift!
      if (data.refreshToken) {
        localStorage.setItem('erp_refresh_token', data.refreshToken);
      } else {
        console.error("WARNING: Backend did not send a refreshToken!");
      }
      
      // Clear React Query cache to prevent data leaking between shifts
      queryClient.clear(); 
      window.location.reload();
    }
  });
};

export const logout = () => {
  // Completely scrub the POS terminal session
  localStorage.removeItem('erp_token');
  localStorage.removeItem('erp_refresh_token'); // Ensure this is destroyed!
  localStorage.removeItem('erp_user');
  window.location.reload(); 
};