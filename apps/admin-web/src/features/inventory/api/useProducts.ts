import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  trackInventory: boolean;
  categoryId: {
    _id: string;
    name: string;
  };
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/products');
  return data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
};