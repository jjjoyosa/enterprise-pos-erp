import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface POSInventoryLevel {
  _id: string;
  productId: { _id: string; name: string; sku: string; basePrice: number; barcode?: string };
  warehouseId: { _id: string; name: string };
  quantity: number;
}

export const useInventory = () => {
  return useQuery<POSInventoryLevel[]>({
    queryKey: ['pos-inventory-levels'],
    queryFn: async () => {
      
      const { data } = await api.get('/inventory');
      return data;
    },
    
    staleTime: 0, 
    refetchInterval: 15000, 
    refetchOnWindowFocus: true, 
  });
};

