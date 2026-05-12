import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { saveOfflineSale } from '../services/db';


export interface SalePayload {
  shiftId?: string;
  paymentMethod: 'CASH' | 'CARD' | 'GCASH' | 'MAYA';
  discount: number;
  customerId?: string | null;
  subtotal: number;
  tax: number;
  totalAmount: number;
  amountTendered: number;
  changeDue: number;
  items: Array<{ productId: string; name: string; quantity: number; unitPrice: number; subtotal: number }>;
}

const processSale = async (payload: SalePayload) => {
  console.log('[CHECKOUT] 1. Process Sale Triggered');
  
  const handleOfflineSave = async () => {
    console.log('[CHECKOUT] 2a. Routing to Offline Save');
    const offlineReceiptNumber = `OFFLINE-${Date.now()}`;
    
    try {
      console.log('[CHECKOUT] 2b. Awaiting IndexedDB Put...');
      
      await saveOfflineSale({
        receiptNumber: offlineReceiptNumber,
        ...payload,
        timestamp: new Date().toISOString()
      });
      
      console.log('[CHECKOUT] 2c. IndexedDB Save Complete!');
      
      return { 
        message: 'Saved offline', 
        sale: { receiptNumber: offlineReceiptNumber, ...payload },
        isOffline: true 
      };
    } catch (dbError) {
      console.error('[CHECKOUT] 2d. IndexedDB CRASH:', dbError);
      throw dbError;
    }
  };

  console.log('[CHECKOUT] 3. Checking navigator.onLine:', navigator.onLine);
  if (!navigator.onLine) {
    return handleOfflineSave();
  }

  try {
    console.log('[CHECKOUT] 4. Attempting Live API Call...');
    
    
    const { data } = await api.post('/sales', payload);
    
    console.log('[CHECKOUT] 5. Live API Call Successful!');
    return data;

  } catch (error: any) {
    console.warn('[CHECKOUT] 6. Live API threw error:', error.code, error.message);
    
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return handleOfflineSave();
    }
    
    throw error;
  }
};

export const useProcessSale = () => {
  const queryClient = useQueryClient(); 
  
  return useMutation({
    mutationFn: processSale,
    networkMode: 'always',
    onSuccess: (data) => {
      
      if (!data?.isOffline) {
        queryClient.invalidateQueries({ queryKey: ['pos-inventory-levels'] });
        queryClient.invalidateQueries({ queryKey: ['pos-products'] });
      }
    }
  });
};