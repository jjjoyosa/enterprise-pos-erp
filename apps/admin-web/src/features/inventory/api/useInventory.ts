import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';

export interface InventoryLevel {
  _id: string;
  productId: { _id: string; name: string; sku: string; basePrice: number; barcode?: string };
  warehouseId: { _id: string; name: string };
  quantity: number;
}

export interface StockMovementPayload {
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reference?: string;
  notes?: string;
}


export interface StockMovementRecord {
  _id: string;
  productId: { name: string; sku: string };
  warehouseId: { name: string };
  type: 'IN' | 'OUT' | 'ADJUST' | 'SALE';
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  createdAt: string;
}


export const useStockMovementHistory = () => {
  return useQuery<StockMovementRecord[]>({
    queryKey: ['stock-movements'],
    queryFn: async () => {
      const { data } = await api.get('/inventory/movements');
      return data;
    },
  });
};

export const useInventoryLevels = () => {
  return useQuery<InventoryLevel[]>({
    queryKey: ['inventory-levels'],
    queryFn: async () => {
      
      const { data } = await api.get('/inventory?includeArchived=true');
      return data;
    },
  });
};

export const useStockMovement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: StockMovementPayload) => {
      const { data } = await api.post('/inventory/movements', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
    },
  });
};