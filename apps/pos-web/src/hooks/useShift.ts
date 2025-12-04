import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';


const fetchCurrentShift = async () => {
  try {
    const { data } = await api.get('/shifts/current');
    return data;
  } catch (error: any) {
    if (error.response?.status === 404) return null; 
    throw error;
  }
};

export const useCurrentShift = () => {
  return useQuery({
    queryKey: ['current-shift'],
    queryFn: fetchCurrentShift,
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
    }
  });
};