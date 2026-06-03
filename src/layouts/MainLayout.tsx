import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/ui/Sidebar';
import { Header } from '@/components/ui/Header';

const MainLayout: React.FC = () => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Skip to Content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-sda-blue focus:shadow-lg dark:focus:bg-slate-900"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Sidebar Component */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Component */}
        <Header
          setIsMobileOpen={setIsMobileOpen}
          hasSidebarLayout
          isSidebarCollapsed={isCollapsed}
        />

        {/* Content Outlet */}
        <main
          id="main-content"
          className="flex-1 overflow-y-auto px-4 pb-4 pt-14 sm:px-5 sm:pb-5 sm:pt-16 md:px-6 md:pb-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
