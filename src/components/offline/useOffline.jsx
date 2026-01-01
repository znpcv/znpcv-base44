import { useContext } from 'react';
import { OfflineContext } from './OfflineManager';

export const useOffline = () => {
  const context = useContext(OfflineContext);
  
  if (!context) {
    // Fallback if context not available
    return {
      isOnline: true,
      pendingCount: 0,
      syncInProgress: false,
      storage: null,
      updatePendingCount: () => {}
    };
  }
  
  return context;
};