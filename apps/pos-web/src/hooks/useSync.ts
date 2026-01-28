import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { getPendingSales, clearPendingSale } from '../services/db'; 

export const useSyncOfflineSales = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('[SYNC] 1. Starting Offline Sync Protocol...');
      
      
      const offlineSales = await getPendingSales();
      if (!offlineSales || offlineSales.length === 0) {
        return { success: 0, failed: 0, message: 'No offline sales to sync.' };
      }

      let successCount = 0;
      let failCount = 0;

      console.log(`[SYNC] 2. Found ${offlineSales.length} pending sales. Syncing...`);

      for (const sale of offlineSales) {
        try {
          await api.post('/sales', {
            paymentMethod: sale.paymentMethod,
            discount: sale.discount || 0,
            items: sale.items
          });

          
          await clearPendingSale(sale.receiptNumber);
          successCount++;
          console.log(`[SYNC] Success: ${sale.receiptNumber}`);
        } catch (error: any) {
          console.error(`[SYNC] Failed: ${sale.receiptNumber}`, error);
          failCount++;
        }
      }

      return { success: successCount, failed: failCount };
    },
    onSuccess: (result) => {
      if (result.success > 0) {
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['current-shift'] });
        alert(`Sync Complete! Successfully uploaded ${result.success} offline sales.`);
      }
    }
  });
};