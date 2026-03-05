import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';

export interface Employee {
  _id: string;
  name: string;
  email: string;
  role: 'CASHIER' | 'MANAGER' | 'ADMIN';
  isActive: boolean;
  branchId?: string;
}

export const useStaff = () => {
  return useQuery<Employee[]>({
    queryKey: ['staff'],
    queryFn: async () => {
      const { data } = await api.get('/employees');
      return data;
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (staffData: Partial<Employee> & { pinCode: string }) => {
      const { data } = await api.post('/employees', staffData);
      return data;
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });
};