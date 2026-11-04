import React, { useState, useCallback, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogoStore } from '@/store/useLogoStore';
import { NAVIGATION_CONFIG, NavItem } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  ChevronRight,
  X,
  LogOut,
  Pin,
  PinOff,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  /** Called whenever the sidebar's visual expanded state changes (hover, pin, collapse) */
  onExpandedChange?: (expanded: boolean) => void;
}

const ADMIN_ROUTES: string[] = [
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_USERS_SELECT,
  ROUTES.ADMIN_FIELDS,
  ROUTES.ROLES_PERMISSIONS,
  ROUTES.REPORTS,
  ROUTES.ANALYTICS,
  ROUTES.LANDING_PAGE,
  ROUTES.AUDIT_LOGS,
];

const COMMUNICATION_ROUTES: string[] = [
  ROUTES.ANNOUNCEMENTS,
  ROUTES.PRAYER_COUNSELING,
  ROUTES.TRAINING,
  ROUTES.DOCUMENTS,
  ROUTES.FORUMS,
  ROUTES.VOLUNTEER_HOURS,
  ROUTES.VOLUNTEER_RECOGNITION,
];

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onExpandedChange,
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const { logoDataUrl } = useLogoStore();
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isExpanded = isPinned || !isCollapsed || isHovered;

  // Notify parent whenever expanded state changes
  useEffect(() => {
    onExpandedChange?.(isExpanded);
  }, [isExpanded, onExpandedChange]);

  const handleMouseEnter = useCallback(() => {
    if (!isPinned && isCollapsed) setIsHovered(true);
  }, [isPinned, isCollapsed]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const togglePin = () => {
    const nextPinned = !isPinned;
    setIsPinned(nextPinned);
    if (nextPinned) {
      setIsCollapsed(false);
      setIsHovered(false);
    } else {
      setIsCollapsed(true);
      setIsHovered(false);
    }
  };

  const toggleSubMenu = (labelKey: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [labelKey]: !prev[labelKey],
    }));
  };

  const isNavActive = (to?: string) => {
    if (!to) return false;
    const path = location.pathname;
    if (to === '/') return path === '/';
    if (to === '/#achievements') return path === '/' && location.hash === '#achievements';
    if (to === '/dashboard') return path === '/dashboard';
    return path === to || path.startsWith(`${to}/`);
  };

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

  // Group items into sections (Portal, Administration, Communication)
  const getNavSections = (items: NavItem[]) => {
    const portalItems: NavItem[] = [];
    const adminItems: NavItem[] = [];
    const commItems: NavItem[] = [];

    for (const item of items) {
      if (item.to && ADMIN_ROUTES.some((r) => item.to === r || item.to?.startsWith(r))) {
        adminItems.push(item);
      } else if (item.to && COMMUNICATION_ROUTES.some((r) => item.to === r || item.to?.startsWith(r))) {
        commItems.push(item);
      } else {
        portalItems.push(item);
      }
    }

    const sections = [];
    if (portalItems.length > 0) {
      sections.push({ key: 'portal', title: 'PORTAL', items: portalItems });
    }
    if (adminItems.length > 0) {
      sections.push({ key: 'admin', title: 'ADMINISTRATION', items: adminItems });
    }
    if (commItems.length > 0) {
      sections.push({ key: 'comm', title: 'COMMUNICATION', items: commItems });
    }
    return sections;
  };

  const navSections = getNavSections(filteredNavItems);

  const renderNavItem = (item: NavItem, forceExpanded = false) => {
    const expanded = forceExpanded || isExpanded;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.to ? isNavActive(item.to) : false;
    const isOpen = openSubMenus[item.labelKey];

    const linkClasses = cn(
      'flex items-center rounded-xl transition-all duration-200 group relative',
      expanded ? 'px-3 py-2.5 justify-between w-full' : 'w-10 h-10 mx-auto justify-center',
      isActive
        ? 'bg-[#0D47A1] text-white shadow-xs font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0D47A1] dark:hover:text-sda-gold font-medium'
    );

    const iconAndLabel = (
      <div className={cn('flex items-center gap-3 min-w-0', expanded ? 'w-full' : 'justify-center')}>
        <span
          className={cn(
            'shrink-0 transition-transform duration-200 group-hover:scale-105',
            isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-[#0D47A1] dark:group-hover:text-sda-gold'
          )}
        >
          {item.icon}
        </span>
        {expanded && (
          <span className="font-semibold text-xs lg:text-sm tracking-wide truncate">
            {t(item.labelKey)}
          </span>
        )}
      </div>
    );

    if (hasSubItems) {
      return (
        <div key={item.labelKey} className="space-y-0.5">
          <button
            type="button"
            onClick={() => {
              if (!expanded) return;
              toggleSubMenu(item.labelKey);
            }}
            className={cn(linkClasses, 'cursor-pointer')}
            title={!expanded ? t(item.labelKey) : undefined}
          >
            {iconAndLabel}
            {expanded && (
              <span className="shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </span>
            )}
          </button>
          <AnimatePresence initial={false}>
            {isOpen && expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="pl-9 space-y-0.5 overflow-hidden"
              >
                {item.subItems?.map((sub) => {
                  const isSubActive = isNavActive(sub.to);
                  return (
                    <Link
                      key={sub.to}
                      to={sub.to || '#'}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        'block rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200',
                        isSubActive
                          ? 'text-[#0D47A1] dark:text-sda-gold font-bold bg-[#0D47A1]/10 dark:bg-sda-gold/15'
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

    if (item.to?.startsWith('/#')) {
      const targetHash = item.to.slice(2);
      return (
        <div key={item.labelKey} className="relative group">
          <a
            href={item.to}
            onClick={(e) => {
              setIsMobileOpen(false);
              if (location.pathname === '/') {
                e.preventDefault();
                const el = document.getElementById(targetHash);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={linkClasses}
            title={!expanded ? t(item.labelKey) : undefined}
          >
            {iconAndLabel}
          </a>
        </div>
      );
    }

    return (
      <div key={item.labelKey} className="relative group">
        <Link
          to={item.to || '#'}
          onClick={() => setIsMobileOpen(false)}
          className={linkClasses}
          title={!expanded ? t(item.labelKey) : undefined}
        >
          {iconAndLabel}
        </Link>
      </div>
    );
  };

  // Header Brand Component (matches user's reference photos)
  const SidebarBrand = () => (
    <div className="h-[72px] border-b border-slate-200 dark:border-slate-800 flex items-center shrink-0 overflow-hidden">
      {isExpanded ? (
        /* EXPANDED (matches Photo 1): Logo + 2-line Brand Name + Pin Button */
        <div className="w-full px-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
              <img
                src={logoDataUrl || '/frontend/uploads/photo33.png'}
                alt={t('mifem.logoAlt')}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col justify-center leading-tight">
              <span className="font-black text-[10.5px] uppercase tracking-tight text-[#0D47A1] dark:text-sda-gold">
                Women & Girls Ministry
              </span>
              <span className="font-bold text-[9px] uppercase tracking-wide text-[#0D47A1]/80 dark:text-sda-gold/80">
                Coordination Platform
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={togglePin}
            title={isPinned ? t('sidebar.unpin') : t('sidebar.pin')}
            className={cn(
              'p-1.5 rounded-lg border transition-all duration-200 shrink-0 ml-1',
              isPinned
                ? 'text-[#0D47A1] dark:text-sda-gold bg-[#0D47A1]/10 dark:bg-sda-gold/15 border-[#0D47A1]/20 dark:border-sda-gold/30'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
          </button>
        </div>
      ) : (
        /* COLLAPSED (matches Photo 2): Scaled Logo + Compact 2-line Brand Name */
        <div className="w-full px-1.5 flex items-center justify-center gap-1.5">
          <div className="w-6 h-6 rounded-md overflow-hidden shrink-0 flex items-center justify-center">
            <img
              src={logoDataUrl || '/frontend/uploads/photo33.png'}
              alt={t('mifem.logoAlt')}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col justify-center leading-[1.05]">
            <span className="font-black text-[6.5px] uppercase tracking-tighter text-[#0D47A1] dark:text-sda-gold">
              Women & Girls
            </span>
            <span className="font-bold text-[6px] uppercase tracking-tighter text-[#0D47A1]/80 dark:text-sda-gold/80">
              Platform
            </span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── full-height, starts from top ── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
          'transition-all duration-300 ease-in-out',
          'fixed top-0 bottom-0 left-0 z-50 shrink-0',
          'shadow-xl shadow-slate-200/40 dark:shadow-none overflow-hidden',
          isExpanded ? 'w-64' : 'w-[68px]'
        )}
      >
        <SidebarBrand />

        {/* Navigation Sections with Category Headers / Dividers (matches photos) */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {navSections.map((sec, idx) => (
            <div key={sec.key} className="space-y-1">
              {/* Section Header or Divider */}
              {idx > 0 && (
                isExpanded ? (
                  <div className="px-3 pt-3 pb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {sec.title}
                    </span>
                  </div>
                ) : (
                  <div className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 mx-auto my-2" />
                )
              )}
              {idx === 0 && isExpanded && (
                <div className="px-3 pt-2 pb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {sec.title}
                  </span>
                </div>
              )}
              {/* Nav Items in this section */}
              {sec.items.map((item) => renderNavItem(item))}
            </div>
          ))}
        </nav>

        {/* Bottom Actions: Settings & Logout (matches photos) */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shrink-0">
          {/* Settings Button (Solid Blue) */}
          <Link
            to={ROUTES.SETTINGS}
            className={cn(
              'rounded-xl flex items-center transition-all duration-200 bg-[#0D47A1] hover:bg-[#0B2E78] text-white shadow-xs font-semibold text-xs relative group',
              isExpanded
                ? 'w-full px-3.5 py-2.5 gap-3 justify-start'
                : 'w-10 h-10 mx-auto justify-center'
            )}
            title={t('nav.settings') || 'Settings'}
          >
            <Settings size={18} className="shrink-0" />
            {isExpanded && (
              <span className="truncate">{t('nav.settings') || 'Settings'}</span>
            )}
            {/* Active indicator dot if currently on settings page */}
            {location.pathname === ROUTES.SETTINGS && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-sky-400 ring-2 ring-white dark:ring-slate-900" />
            )}
          </Link>

          {/* Logout Button (Outlined) */}
          <button
            type="button"
            onClick={logout}
            className={cn(
              'rounded-xl flex items-center transition-all duration-200 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs',
              isExpanded
                ? 'w-full px-3.5 py-2.5 gap-3 justify-start'
                : 'w-10 h-10 mx-auto justify-center'
            )}
            title={t('common.logout') || 'Logout'}
          >
            <LogOut size={18} className="shrink-0" />
            {isExpanded && (
              <span className="truncate">{t('common.logout') || 'Logout'}</span>
            )}
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex" role="dialog" aria-modal="true">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex h-full w-[280px] flex-col bg-white dark:bg-slate-900 shadow-2xl border-r border-slate-200 dark:border-slate-800"
            >
              {/* Mobile Drawer Top Brand */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 min-h-[64px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                    <img
                      src={logoDataUrl || '/frontend/uploads/photo33.png'}
                      alt={t('mifem.logoAlt')}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex flex-col justify-center leading-tight">
                    <span className="font-black text-xs uppercase tracking-tight text-[#0D47A1] dark:text-sda-gold">
                      Women & Girls Ministry
                    </span>
                    <span className="font-bold text-[9px] uppercase tracking-wide text-[#0D47A1]/80 dark:text-sda-gold/80">
                      Coordination Platform
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label={t('sidebar.closeMenu')}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Navigation with Categories */}
              <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navSections.map((sec, idx) => (
                  <div key={sec.key} className="space-y-1">
                    <div className="px-3 pt-3 pb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {sec.title}
                      </span>
                    </div>
                    {sec.items.map((item) => renderNavItem(item, true))}
                  </div>
                ))}
              </nav>

              {/* Mobile Bottom Actions (Settings & Logout) */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <Link
                  to={ROUTES.SETTINGS}
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-[#0D47A1] hover:bg-[#0B2E78] text-white shadow-xs font-semibold text-xs justify-start"
                >
                  <Settings size={18} />
                  <span>{t('nav.settings') || 'Settings'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 font-semibold text-xs justify-start"
                >
                  <LogOut size={18} />
                  <span>{t('common.logout') || 'Logout'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
