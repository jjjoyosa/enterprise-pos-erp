import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api'; // Make sure this points to your POS api instance

export interface DiscountRule {
  _id: string;
  name: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  target: 'ENTIRE_CART' | 'SPECIFIC_ITEM';
  targetProductId?: string;
  minPurchaseAmount: number;
}

export const useActiveDiscounts = () => {
  return useQuery<DiscountRule[]>({
    queryKey: ['active-discounts'],
    queryFn: async () => {
      const { data } = await api.get('/discounts/active');
      return data;
    },
  });
};