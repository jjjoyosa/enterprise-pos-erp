import { api } from './api';
import { getPendingSales, clearPendingSale } from './db';

export const syncOfflineSales = async () => {
  try {
    const pendingSales = await getPendingSales();
    
    if (pendingSales.length === 0) {
      return { syncedCount: 0, skippedCount: 0, failedCount: 0 };
    }

    console.log(`[Sync Worker] Found ${pendingSales.length} offline sales. Attempting sync...`);

    
    const { data } = await api.post('/sales/sync', {
      sales: pendingSales
    });

    const { synced, skipped } = data.details;

    
    for (const receiptNumber of synced) {
      await clearPendingSale(receiptNumber);
    }

    
    for (const receiptNumber of skipped) {
      await clearPendingSale(receiptNumber);
    }

    console.log(`[Sync Worker] Success! Synced: ${synced.length}, Skipped: ${skipped.length}`);
    return data.summary;

  } catch (error) {
    console.error('[Sync Worker] Sync failed. Will retry later.', error);
    throw error;
  }
};