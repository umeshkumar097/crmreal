'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30s
            gcTime: 5 * 60 * 1000, // 5m
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            border: '1px solid #334155',
            borderRadius: '10px',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#F8FAFC' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' } },
        }}
      />
    </QueryClientProvider>
  );
}
