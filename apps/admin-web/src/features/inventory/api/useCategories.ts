import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api'; 

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
}


export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products/categories');
        return data;
      } catch (error) {
        console.error("Categories API Error:", error);
        return []; 
      }
    },
    retry: false 
  });
};


export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCategory: { name: string; description?: string }) => {
      const { data } = await api.post('/products/categories', newCategory);
      
      
      return data.category; 
    },
    onSuccess: () => {
      
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Failed to create category:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to create category");
    }
  });
};