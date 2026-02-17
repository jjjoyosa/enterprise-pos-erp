import { useQuery } from '@tanstack/react-query';
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
        return []; // Return empty array on failure
      }
    },
    retry: false // Stop retrying if 404 persists
  });
};