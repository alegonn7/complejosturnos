'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import React from 'react'; // ✅ AGREGADO

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Devtools solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtoolsLazy />
      )}
    </QueryClientProvider>
  );
}

// Lazy load devtools
function ReactQueryDevtoolsLazy() {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const { ReactQueryDevtools } = require('@tanstack/react-query-devtools');
  return <ReactQueryDevtools initialIsOpen={false} />;
}