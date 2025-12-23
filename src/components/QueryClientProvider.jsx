import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export default function QueryClientProvider({ children }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Make queryClient globally available for cross-component communication
    window.queryClient = queryClient;
    
    return () => {
      delete window.queryClient;
    };
  }, [queryClient]);

  return <>{children}</>;
}