import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; 

export interface POSInventoryItem {
  _id: string;
  quantity: number;
  productId: {
    _id: string;
    name: string;
    sku: string;
    basePrice: number;
    barcode?: string;
  };
}

export const useInventory = () => {
  return useQuery<POSInventoryItem[]>({
    queryKey: ['pos-inventory'],
    queryFn: async () => {
      
      const { data } = await api.get('/inventory'); 
      return data;
    },
    
    refetchInterval: 30000, 
  });
};