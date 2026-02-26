import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; // Make sure this uses the interceptor!

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
}

export const usePosProducts = () => {
  return useQuery<POSProduct[]>({
    queryKey: ['pos-products'],
    queryFn: async () => {
      // The interceptor automatically attaches the Cashier's token, 
      // so the backend knows exactly which tenant's products to return!
      const { data } = await api.get('/products');
      return data;
    },
  });
};