import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProofbenchThemeProvider } from './design-system/themes/ProofbenchThemeProvider';
import { HybridDashboardPage } from './pages/HybridDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ProofbenchThemeProvider>
        <HybridDashboardPage />
      </ProofbenchThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
