import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useSalesHistory = () => {
  return useQuery({
    queryKey: ['sales-history'],
    queryFn: async () => {
      const { data } = await api.get('/sales');
      return data;
    },
    
    refetchInterval: 30000, 
  });
};