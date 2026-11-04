import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/ui/Sidebar';
import MainHeader from '@/components/header/MainHeader';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      {/* Skip to Content for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-sda-blue focus:shadow-lg dark:focus:bg-slate-900"
      >
        {t('a11y.skipToContent')}
      </a>

      {/* Sidebar — fixed, full-height, z-50 */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onExpandedChange={setIsSidebarExpanded}
      />

      {/* Everything right of the sidebar: header + content */}
      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          // When sidebar is expanded (hovered, uncollapsed, or pinned), push content by 256px (w-64)
          // When collapsed, push by 68px (w-[68px])
          isSidebarExpanded ? 'md:ml-64' : 'md:ml-[68px]'
        )}
      >
        {/* Header — stretches to fill remaining width */}
        <MainHeader hasSidebar onOpenSidebar={() => setIsMobileOpen(true)} />

        {/* Content Outlet */}
        <main
          id="main-content"
          className="flex-1 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
