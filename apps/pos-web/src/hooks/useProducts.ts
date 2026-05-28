import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; 

export interface POSProduct {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  trackInventory: boolean;
  categoryId?: {
    _id: string;
    name: string;
  };
  imageUrl?: string;
}

export const usePosProducts = () => {
  return useQuery<POSProduct[]>({
    queryKey: ['pos-products'],
    queryFn: async () => {
      const { data } = await api.get('/products');
      return data;
    },
    
    staleTime: 0, 
    refetchInterval: 30000, 
    refetchOnWindowFocus: true, 
  });
};