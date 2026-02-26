import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../services/api'; // Adjust path if needed based on where this file lives

export interface Category {
  _id: string;
  name: string;
  description?: string;
  parentId?: string;
}

// 1. Fetch Categories (With your safety net)
export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/products/categories');
        return data;
      } catch (error) {
        console.error("Categories API Error:", error);
        return []; // Return empty array on failure so the dropdown doesn't crash
      }
    },
    retry: false // Stop retrying if it fails
  });
};

// 2. Create Category (For your Quick Add button!)
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCategory: { name: string; description?: string }) => {
      const { data } = await api.post('/products/categories', newCategory);
      // Your backend returns { message: '...', category: { ... } }
      // We must return the inner category object so the form can grab its _id!
      return data.category; 
    },
    onSuccess: () => {
      // Instantly refresh the categories list in the background
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Failed to create category:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to create category");
    }
  });
};