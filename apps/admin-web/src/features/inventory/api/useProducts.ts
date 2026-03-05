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
  
  const { data } = await api.get('/products?includeArchived=true');
  return data;
};

const createProduct = async (newProduct: Partial<Product>) => {
  const { data } = await api.post('/products', newProduct);
  return data;
};

const updateProduct = async ({ id, data }: { id: string; data: Partial<Product> }) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

const deleteProduct = async (id: string) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
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


export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};


export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};