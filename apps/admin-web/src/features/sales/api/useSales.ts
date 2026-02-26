import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  // THE FIX: Added status and notes to match the updated backend
  status: 'COMPLETED' | 'VOIDED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  notes?: string;
  items: Array<{
    productId: string; // Needed so we can target specific items for partial refunds
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

// --- NEW: THE REFUND ENGINE HOOKS ---

export interface RefundPayload {
  saleId: string;
  refundReason: string;
  itemsToRefund: Array<{
    productId: string;
    quantity: number;
  }>;
}

export const useRefundSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: RefundPayload) => {
      const { data } = await api.post(`/sales/${payload.saleId}/refund`, {
        refundReason: payload.refundReason,
        itemsToRefund: payload.itemsToRefund
      });
      return data;
    },
    onSuccess: () => {
      // Instantly refresh the ledger so the UI shows 'REFUNDED'
      queryClient.invalidateQueries({ queryKey: ['admin-sales-ledger'] });
      // Instantly refresh the inventory so the manager sees the stock return!
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
      queryClient.invalidateQueries({ queryKey: ['stock-ledger'] });
    },
    onError: (error: any) => {
      console.error("Refund failed:", error.response?.data || error.message);
      alert(error.response?.data?.error || "Failed to process refund");
    }
  });
};