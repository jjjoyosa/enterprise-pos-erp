import { useEffect, useRef } from 'react';
import { useCartStore } from '../store/useCartStore';
import type { POSInventoryItem } from './useInventory'; 

export const useBarcodeScanner = (inventory: POSInventoryItem[] | undefined) => {
  const addItem = useCartStore((state) => state.addItem);
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!inventory) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const currentTime = Date.now();
      
      
      if (currentTime - lastKeyTimeRef.current > 40) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      if (e.key === 'Enter') {
        if (bufferRef.current.length > 2) {
          const scannedCode = bufferRef.current.trim();
          
          
          const matchedItem = inventory.find(
            item => item.productId?.barcode === scannedCode || item.productId?.sku === scannedCode
          );
          
          if (matchedItem) {
            const currentStock = matchedItem.quantity ?? 0;

            
            if (currentStock > 0) {
              
              addItem({
                _id: matchedItem.productId._id,
                name: matchedItem.productId.name,
                basePrice: matchedItem.productId.basePrice,
                stock: currentStock
              });
            } else {
              console.warn(`Scan rejected: ${matchedItem.productId.name} is out of stock.`);
            }
          } else {
            console.warn(`No product matches barcode/SKU: ${scannedCode}`);
          }
          
          bufferRef.current = '';
          e.preventDefault();
        }
      } else {
        if (e.key.length === 1) {
          bufferRef.current += e.key;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inventory, addItem]);
};