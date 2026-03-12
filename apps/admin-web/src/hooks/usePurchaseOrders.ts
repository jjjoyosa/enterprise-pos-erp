import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const usePurchaseOrders = () => {
  return useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: async () => {
      const { data } = await api.get('/purchasing/orders');
      return data;
    }
  });
};

export const useCreatePO = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPO: any) => {
      const { data } = await api.post('/purchasing/orders', newPO);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
  });
};

export const useUpdatePOStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data } = await api.patch(`/purchasing/orders/${id}/status`, { status });
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
  });
};