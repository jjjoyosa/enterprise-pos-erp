import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Product {
  _id: string;
  name: string;
  sku: string;
  basePrice: number;
  barcode?: string;
  stock?: number;
}

const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await api.get('/products');
  return data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['pos-products'],
    queryFn: fetchProducts,
  });
};