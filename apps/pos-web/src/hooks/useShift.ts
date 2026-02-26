import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useCurrentShift = () => {
  return useQuery({
    queryKey: ['current-shift'],
    queryFn: async () => {
      const { data } = await api.get('/shifts/current');
      return data;
    },
    retry: false, 
  });
};

export const useOpenShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (startingCash: number) => {
      const { data } = await api.post('/shifts/open', { startingCash });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-shift'] });
    },
    onError: (error: any) => {
      console.error("Failed to open shift:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to open shift. Check console.");
    }
  });
};

export const useCloseShift = () => {

  return useMutation({
    mutationFn: async (endingCash: number) => {
      const { data } = await api.post('/shifts/close', { endingCash });
      return data;
    },
    onError: (error: any) => {
      console.error("Failed to close shift:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to close shift. Check console.");
    }
  });
};