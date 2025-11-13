import { useState, useEffect, useRef } from 'react';
import { syncOfflineSales } from '../services/sync';

export const useNetworkSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<any>(null);
  
  
  const isSyncingRef = useRef(false);

  const triggerSync = async () => {
    if (isSyncingRef.current) return; 
    
    isSyncingRef.current = true;
    setIsSyncing(true);
    
    try {
      const result = await syncOfflineSales();
      if (result && (result.syncedCount > 0 || result.failedCount > 0)) {
        setLastSyncResult(result);
        setTimeout(() => setLastSyncResult(null), 5000);
      }
    } catch (error) {
      
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    
    if (navigator.onLine) triggerSync();

    
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    
    const heartbeat = setInterval(() => {
      if (navigator.onLine) {
        triggerSync();
      }
    }, 15000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(heartbeat);
    };
  }, []);

  return { isOnline, isSyncing, lastSyncResult };
};