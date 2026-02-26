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
      // The cashier token ensures this only fetches inventory for their tenant
      const { data } = await api.get('/inventory');
      return data;
    },
    // --- THE MAGIC SAUCE FOR POS REAL-TIME FEEL ---
    staleTime: 0, // Consider data instantly stale
    refetchInterval: 15000, // Silently fetch fresh stock every 15 seconds!
    refetchOnWindowFocus: true, // Fetch immediately if they click back into the POS tab
  });
};