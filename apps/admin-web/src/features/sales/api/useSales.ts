import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';

export interface SaleRecord {
  _id: string;
  receiptNumber: string;
  cashierId?: { name: string; email: string };
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
  createdAt: string;
}

export const useSalesLedger = () => {
  return useQuery<SaleRecord[]>({
    queryKey: ['admin-sales-ledger'],
    queryFn: async () => {
      const { data } = await api.get('/sales');
      return data;
    },
  });
};