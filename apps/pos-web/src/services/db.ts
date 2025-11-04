import { openDB } from 'idb';
import type { DBSchema } from 'idb';


interface POSDatabase extends DBSchema {
  'offline-sales': {
    key: string; 
    value: {
      receiptNumber: string;
      warehouseId: string;
      cashierId: string;
      paymentMethod: string;
      discount: number;
      items: Array<{ productId: string; quantity: number }>;
      timestamp: string;
    };
  };
}


const dbPromise = openDB<POSDatabase>('enterprise-pos-local', 1, {
  upgrade(db) {
    db.createObjectStore('offline-sales', { keyPath: 'receiptNumber' });
  },
});

export const saveOfflineSale = async (sale: POSDatabase['offline-sales']['value']) => {
  const db = await dbPromise;
  await db.put('offline-sales', sale);
  console.log(`[IndexedDB] Saved offline sale: ${sale.receiptNumber}`);
};

export const getPendingSales = async () => {
  const db = await dbPromise;
  return db.getAll('offline-sales');
};

export const clearPendingSale = async (receiptNumber: string) => {
  const db = await dbPromise;
  await db.delete('offline-sales', receiptNumber);
};