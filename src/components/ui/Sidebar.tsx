import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { NAVIGATION_CONFIG, NavItem } from '@/constants/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronRight, Menu, X, LogOut, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);

  const isExpanded = !isCollapsed || isHovered;

  const toggleSubMenu = (labelKey: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [labelKey]: !prev[labelKey],
    }));
  };

  const isNavActive = (to?: string) => {
    if (!to) return false;
    const path = location.pathname;
    if (to === '/dashboard') return path === '/dashboard' || path === '/';
    return path === to || path.startsWith(`${to}/`);
  };

  // Filter navigation items by role and flatten subnav for MEMBER
  const filteredNavItems = NAVIGATION_CONFIG.filter((item) => {
    if (item.roles === 'ALL') return true;
    if (!user?.role) return false;
    return item.roles.includes(user.role);
  }).map((item) => {
    if (user?.role === 'MEMBER') {
      return { ...item, subItems: undefined };
    }
    return item;
  });

  const renderNavItem = (item: NavItem) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.to ? isNavActive(item.to) : false;
    const isOpen = openSubMenus[item.labelKey];

    const linkClasses = cn(
      'flex items-center justify-between rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 transition-all duration-200 group relative',
      isActive
        ? 'bg-gradient-to-r from-sda-blue to-sda-blue-dark text-white shadow-md shadow-sda-blue/20'
        : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sda-blue dark:hover:text-sda-gold-light'
    );

    const iconAndLabel = (
      <div className="flex items-center gap-3 min-w-0 w-full">
        <span className={cn(
          'transition-transform duration-200 group-hover:scale-110 shrink-0',
          isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-sda-blue dark:group-hover:text-sda-gold-light'
        )}>
          {item.icon}
        </span>
        <span className={cn(
          'font-semibold text-sm tracking-wide truncate transition-all duration-300 ease-in-out origin-left',
          isExpanded ? 'opacity-100 max-w-xs translate-x-0 visible' : 'opacity-0 max-w-0 -translate-x-4 invisible overflow-hidden'
        )}>
          {t(item.labelKey)}
        </span>
      </div>
    );

    if (hasSubItems) {
      return (
        <div key={item.labelKey} className="space-y-1">
          <button
            type="button"
            onClick={() => {
              if (isCollapsed && !isHovered) {
                setIsCollapsed(false);
              }
              toggleSubMenu(item.labelKey);
            }}
            className={cn(linkClasses, 'w-full cursor-pointer')}
          >
            {iconAndLabel}
            <span className={cn(
              'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-all duration-300',
              isExpanded ? 'opacity-100 visible' : 'opacity-0 invisible overflow-hidden w-0'
            )}>
              {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isOpen && isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-9 space-y-1 overflow-hidden"
              >
                {item.subItems?.map((sub) => {
                  const isSubActive = isNavActive(sub.to);
                  return (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'block rounded-lg px-3 py-3 text-xs font-medium transition-all duration-200',
                        isSubActive
                          ? 'text-sda-blue dark:text-sda-gold font-bold bg-sda-blue/5 dark:bg-sda-gold/10'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      )}
                    >
                      {t(sub.labelKey)}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <div key={item.labelKey} className="relative group">
        <Link
          to={item.to || '#'}
          onClick={() => setIsMobileOpen(false)}
          className={linkClasses}
        >
          {iconAndLabel}
        </Link>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar Width Placeholder to prevent layout jump */}
      <div
        className={cn(
          'hidden md:block shrink-0 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      />

      {/* Desktop Sidebar */}
      <aside
        onMouseEnter={() => isCollapsed && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out fixed top-14 sm:top-16 bottom-0 left-0 z-30 shrink-0 shadow-xl shadow-slate-200/40 dark:shadow-none',
          isExpanded ? 'w-64' : 'w-20'
        )}
      >
        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto custom-scrollbar">
          {filteredNavItems.map(renderNavItem)}
        </nav>

        {/* Collapsible toggle button */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setIsCollapsed(!isCollapsed);
              setIsHovered(false); // Reset hover state when manual toggled
            }}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isCollapsed ? t('sidebar.expandSidebar') : t('sidebar.collapseSidebar')}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex h-full w-[280px] flex-col bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-end p-4 border-b border-slate-200 dark:border-slate-800 min-h-[64px]">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label={t('sidebar.closeMenu')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Force isExpanded=true on mobile sidebar so text labels are always visible */}
              <nav className="flex-1 space-y-1.5 p-3 overflow-y-auto">
                {filteredNavItems.map((item) => {
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isActive = item.to ? isNavActive(item.to) : false;
                  const isOpen = openSubMenus[item.labelKey];

                  const linkClasses = cn(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-slate-700 dark:text-slate-200 transition-all duration-200 group relative',
                    isActive
                      ? 'bg-gradient-to-r from-sda-blue to-sda-blue-dark text-white shadow-md shadow-sda-blue/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-sda-blue dark:hover:text-sda-gold-light'
                  );

                  const iconAndLabel = (
                    <div className="flex items-center gap-3 min-w-0 w-full">
                      <span className={cn(
                        'transition-transform duration-200 group-hover:scale-110 shrink-0',
                        isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-sda-blue dark:group-hover:text-sda-gold-light'
                      )}>
                        {item.icon}
                      </span>
                      <span className="font-semibold text-sm tracking-wide truncate">
                        {t(item.labelKey)}
                      </span>
                    </div>
                  );

                  if (hasSubItems) {
                    return (
                      <div key={item.labelKey} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleSubMenu(item.labelKey)}
                          className={cn(linkClasses, 'w-full cursor-pointer')}
                        >
                          {iconAndLabel}
                          <span className="text-slate-400">
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="pl-9 space-y-1 overflow-hidden"
                            >
                              {item.subItems?.map((sub) => {
                                const isSubActive = isNavActive(sub.to);
                                return (
                                  <Link
                                    key={sub.to}
                                    to={sub.to}
                                    onClick={() => setIsMobileOpen(false)}
                                    className={cn(
                        'block rounded-lg px-3 py-3 text-xs font-medium transition-all duration-200',
                                      isSubActive
                                        ? 'text-sda-blue dark:text-sda-gold font-bold bg-sda-blue/5 dark:bg-sda-gold/10'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    )}
                                  >
                                    {t(sub.labelKey)}
                                  </Link>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  return (
                    <div key={item.labelKey} className="relative group">
                      <Link
                        to={item.to || '#'}
                        onClick={() => setIsMobileOpen(false)}
                        className={linkClasses}
                      >
                        {iconAndLabel}
                      </Link>
                    </div>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-tr from-sda-blue to-sda-blue-dark text-white rounded-full flex items-center justify-center font-bold">
                    {user?.name?.charAt(0) || t('header.userFallback').charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={16} />
                  {t('common.logout')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
