import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppRouter from '@/routes/AppRouter';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { FaviconUpdater } from '@/components/ui/FaviconUpdater';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  const loadFromStatic = useAchievementAdminStore((s) => s.loadFromStatic);

  useEffect(() => {
    loadFromStatic();
  }, [loadFromStatic]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRouter />
        <ToastContainer />
        <FaviconUpdater />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
