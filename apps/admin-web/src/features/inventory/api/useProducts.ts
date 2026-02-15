import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  costPrice: number;
  trackInventory: boolean;
  categoryId?: string |  {
    _id: string;
    name: string;
  };
}


const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/products');
  return data;
};


const createProduct = async (newProduct: Partial<Product>) => {
  const { data } = await api.post('/products', newProduct);
  return data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};