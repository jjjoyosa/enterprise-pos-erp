import { useMutation } from '@tanstack/react-query';
import { api } from '../services/api';



const DEV_WAREHOUSE_ID = '6a13f0053e459be6ae886552'; 
const DEV_CASHIER_ID = '6a13eea1a686547665c727e2';

interface SalePayload {
  paymentMethod: 'CASH' | 'CARD' | 'GCASH' | 'MAYA';
  discount: number;
  items: Array<{ productId: string; quantity: number }>;
}

const processSale = async (payload: SalePayload) => {
  const { data } = await api.post('/sales', {
    ...payload,
    warehouseId: DEV_WAREHOUSE_ID,
    cashierId: DEV_CASHIER_ID,
  });
  return data;
};

export const useProcessSale = () => {
  return useMutation({
    mutationFn: processSale,
  });
};