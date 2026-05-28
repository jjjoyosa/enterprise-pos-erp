import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export const useSuppliers = () => {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: async () => {
      const { data } = await api.get('/purchasing/suppliers');
      return data;
    }
  });
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSupplier: any) => {
      const { data } = await api.post('/purchasing/suppliers', newSupplier);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
    onError: (error: any) => alert(error.response?.data?.error || 'Failed to create')
  });
};

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: resData } = await api.put(`/purchasing/suppliers/${id}`, data);
      return resData;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
    onError: (error: any) => alert(error.response?.data?.error || 'Failed to update')
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/purchasing/suppliers/${id}`);
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
    onError: (error: any) => alert(error.response?.data?.error || 'Failed to delete')
  });
};