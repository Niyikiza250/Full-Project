import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ThemeProvider';
import AppRouter from '@/routes/AppRouter';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { FaviconUpdater } from '@/components/ui/FaviconUpdater';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';
import { useBrandingStore } from '@/store/useBrandingStore';

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
  const loadBranding = useBrandingStore((s) => s.load);

  useEffect(() => {
    const refreshSharedContent = () => {
      void loadFromStatic();
      void loadBranding();
    };

    refreshSharedContent();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSharedContent();
    };
    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshSharedContent();
    }, 30_000);

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [loadFromStatic, loadBranding]);

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
