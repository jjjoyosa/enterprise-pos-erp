import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { saveOfflineSale } from '../services/db';

const DEV_WAREHOUSE_ID = '6a13f0053e459be6ae886552'; 
const DEV_CASHIER_ID = '6a13eea1a686547665c727e2';

interface SalePayload {
  paymentMethod: 'CASH' | 'CARD' | 'GCASH' | 'MAYA';
  discount: number;
  items: Array<{ productId: string; quantity: number }>;
}

const processSale = async (payload: SalePayload) => {
  try {
    
    const { data } = await api.post('/sales', {
      ...payload,
      warehouseId: DEV_WAREHOUSE_ID,
      cashierId: DEV_CASHIER_ID,
    });
    return data;

  } catch (error: any) {
    
    if (!error.response || error.code === 'ERR_NETWORK') {
      console.warn('Network unreachable. Routing transaction to local IndexedDB.');
      
      
      const offlineReceiptNumber = `OFFLINE-${Date.now()}`;
      
      const offlinePayload = {
        receiptNumber: offlineReceiptNumber,
        warehouseId: DEV_WAREHOUSE_ID,
        cashierId: DEV_CASHIER_ID,
        paymentMethod: payload.paymentMethod,
        discount: payload.discount,
        items: payload.items,
        timestamp: new Date().toISOString()
      };

      
      await saveOfflineSale(offlinePayload);

      
      return { 
        message: 'Saved offline', 
        sale: { receiptNumber: offlineReceiptNumber },
        isOffline: true 
      };
    }
    
    
    throw error;
  }
};

export const useProcessSale = () => {
  return useMutation({
    mutationFn: processSale,
  });
};