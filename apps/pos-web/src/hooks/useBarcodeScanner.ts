import { useEffect, useRef } from 'react';
import type { Product } from './useProducts';
import { useCartStore } from '../store/useCartStore';

export const useBarcodeScanner = (products: Product[] | undefined) => {
  const addItem = useCartStore((state) => state.addItem);
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!products) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      
      
      if (currentTime - lastKeyTimeRef.current > 40) {
        bufferRef.current = '';
      }

      lastKeyTimeRef.current = currentTime;

      
      if (e.key === 'Enter') {
        if (bufferRef.current.length > 2) {
          const scannedCode = bufferRef.current.trim();
          
          
          const matchedProduct = products.find(p => p.barcode === scannedCode || p.sku === scannedCode);
          
          if (matchedProduct) {
            addItem(matchedProduct);
            
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
  }, [products, addItem]);
};