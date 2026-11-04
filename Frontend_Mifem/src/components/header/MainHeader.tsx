import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useLogoStore } from '@/store/useLogoStore';
import { ROUTES } from '@/constants/routes';
import { NAVIGATION_CONFIG } from '@/constants/navigation';
import { useNotificationReadStore } from '@/store/useNotificationReadStore';
import { useHierarchicalAnnouncements } from '@/hooks/useCommunicationModule';
import { AdventistLogo } from '@/components/common/AdventistLogo';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  LogIn,
  UserPlus,
  Home,
  Newspaper,
  LayoutDashboard,
  User,
  Settings,
} from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';
import NavLinks from './NavLinks';
import LanguageSwitcher from './LanguageSwitcher';
import UserDropdown from './UserDropdown';
import MobileMenu from './MobileMenu';

interface MainHeaderProps {
  hasSidebar?: boolean;
  onOpenSidebar?: () => void;
}

export default function MainHeader({ hasSidebar = false, onOpenSidebar }: MainHeaderProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const { logoDataUrl } = useLogoStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: announcements = [] } = useHierarchicalAnnouncements();
  const { isRead } = useNotificationReadStore();
  const unreadCount = announcements.filter((a) => !isRead(a.id)).length;

  // Active navigation detection (ONLY used inside logged-in account with hasSidebar)
  const activeNav = useMemo(() => {
    if (!hasSidebar) return { title: '', icon: null };

    const path = location.pathname;
    const hash = location.hash;

    // News & updates
    if (hash === '#achievements' || (path === ROUTES.HOME_CONTENT && hash === '#achievements')) {
      return {
        title: t('nav.newsUpdates') || 'News & Updates',
        icon: <Newspaper size={20} />,
      };
    }

    // Home
    if (path === ROUTES.HOME_CONTENT || (path === ROUTES.HOME && !hash)) {
      return {
        title: t('nav.home') || 'Home',
        icon: <Home size={20} />,
      };
    }

    // Profile & Settings
    if (path.startsWith(ROUTES.PROFILE)) {
      return {
        title: t('nav.profile') || 'Profile',
        icon: <User size={20} />,
      };
    }

    if (path.startsWith(ROUTES.SETTINGS) || path.startsWith(ROUTES.SYSTEM_SETTINGS)) {
      return {
        title: t('nav.settings') || 'Settings',
        icon: <Settings size={20} />,
      };
    }

    // Match from NAVIGATION_CONFIG
    for (const item of NAVIGATION_CONFIG) {
      if (!item.to) continue;
      if (item.to === path || (item.to !== '/' && item.to !== '/#achievements' && path.startsWith(item.to))) {
        const title = item.labelKey.includes('.') ? t(item.labelKey) : (t(item.labelKey) || item.labelKey);
        return {
          title,
          icon: item.icon,
        };
      }
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (sub.to && (sub.to === path || path.startsWith(sub.to))) {
            const title = sub.labelKey.includes('.') ? t(sub.labelKey) : (t(sub.labelKey) || sub.labelKey);
            return {
              title,
              icon: item.icon,
            };
          }
        }
      }
    }

    return {
      title: t('nav.dashboard') || 'Dashboard',
      icon: <LayoutDashboard size={20} />,
    };
  }, [hasSidebar, location.pathname, location.hash, t]);

  return (
    <header
      className={cn(
        'z-40 h-[72px] bg-white dark:bg-slate-950 border-b border-[#E2E8F0] dark:border-slate-800 shadow-xs',
        hasSidebar ? 'sticky top-0' : 'fixed top-0 left-0 right-0'
      )}
    >
      <div className="mx-auto flex h-full items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8">

        {/* ========================================================
            LEFT SECTION
            - Landing page: MIFEM Logo + Brand Name
            - Logged-in account: Hamburger + Home & News buttons (left-aligned)
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          {!hasSidebar ? (
            /* LANDING PAGE: Full Logo + Brand Name */
            <Link
              to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
              className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0"
            >
              <div className="md:hidden relative shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <AdventistLogo compact />
              </div>
              <div className="hidden md:block relative shrink-0 w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                  src={logoDataUrl || '/frontend/uploads/photo33.png'}
                  alt={t('mifem.logoAlt')}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs lg:text-sm font-extrabold text-[#0D47A1] dark:text-sda-gold leading-tight max-w-[150px] sm:max-w-[220px] lg:max-w-none line-clamp-2">
                {t('mifem.brandName')}
              </span>
            </Link>
          ) : (
            /* LOGGED-IN ACCOUNT: Mobile menu + Clicked nav icon & title on the left */
            <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
              {onOpenSidebar && (
                <button
                  type="button"
                  onClick={onOpenSidebar}
                  className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
                  aria-label={t('header.openSidebar')}
                >
                  <Menu size={22} />
                </button>
              )}
              {activeNav.icon && (
                <div
                  className="hidden md:flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#0D47A1]/10 dark:bg-sda-gold/15 text-[#0D47A1] dark:text-sda-gold border border-[#0D47A1]/20 dark:border-sda-gold/30 shadow-2xs shrink-0"
                  aria-hidden="true"
                >
                  {activeNav.icon}
                </div>
              )}
              <h1 className="hidden md:block text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight truncate max-w-[130px] sm:max-w-[200px] md:max-w-[280px]">
                {activeNav.title}
              </h1>
            </div>
          )}
        </div>

        {/* ========================================================
            CENTER SECTION
            - Landing page: Public NavLinks
            - Logged-in account: Home & News buttons
           ======================================================== */}
        {!hasSidebar ? (
          <NavLinks />
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center min-w-0 px-2 sm:px-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => navigate(ROUTES.HOME_CONTENT)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0D47A1] dark:text-sda-gold hover:text-white dark:hover:text-sda-blue bg-white dark:bg-slate-900 border border-[#0D47A1]/40 dark:border-sda-gold/40 hover:bg-[#0D47A1] dark:hover:bg-sda-gold rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <Home size={15} />
                <span>{t('nav.home')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate(ROUTES.HOME_CONTENT);
                  setTimeout(() => {
                    const el = document.getElementById('achievements');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 150);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#0D47A1] dark:text-sda-gold hover:text-white dark:hover:text-sda-blue bg-white dark:bg-slate-900 border border-[#0D47A1]/40 dark:border-sda-gold/40 hover:bg-[#0D47A1] dark:hover:bg-sda-gold rounded-lg transition-all cursor-pointer shadow-2xs"
              >
                <Newspaper size={15} />
                <span>{t('nav.newsUpdates')}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            RIGHT SECTION
            - Logged-in account & Landing page actions
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">

          {/* Language Switcher — hidden in the mobile account header */}
          <div className={cn(hasSidebar && 'hidden md:block')}>
            <LanguageSwitcher />
          </div>

          {isAuthenticated ? (
            <>
              {/* Dashboard quick link (visible on Landing page if already logged in) */}
              {!hasSidebar && (
                <Link
                  to={ROUTES.DASHBOARD}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs lg:text-sm font-bold text-sda-blue bg-sda-gold hover:bg-sda-gold-light rounded-lg shadow-xs transition-all"
                >
                  <LayoutDashboard size={14} />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              )}

              {/* Bell / Notifications (logged-in account) */}
              {hasSidebar && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => navigate(ROUTES.COMMUNICATION)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0D47A1]"
                    aria-label={t('header.toggleNotifications')}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute right-2 top-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                    )}
                  </button>
                </div>
              )}

              <UserDropdown />
            </>
          ) : (
            <>
              <Link
                to={ROUTES.LOGIN}
                className="hidden sm:inline-flex items-center gap-1.5 text-[15px] font-semibold text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold transition-colors"
              >
                <LogIn size={18} />
                {t('nav.login')}
              </Link>

              <Link
                to={ROUTES.REGISTER}
                className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 text-[15px] font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#0B2E78] shadow-xs transition-all duration-200"
              >
                <UserPlus size={18} />
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Dark Mode Toggle — hidden in the mobile account header */}
          <button
            type="button"
            onClick={toggleTheme}
            className={cn(
              'inline-flex h-10 w-10 items-center justify-center rounded-full text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all',
              hasSidebar && 'hidden md:inline-flex'
            )}
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* SDA Church Logo */}
          <div className="hidden md:block">
            <AdventistLogo compact />
          </div>

          {/* Mobile Menu Trigger — omitted inside the account; the sidebar
              already provides navigation, keeping the mobile header to 3 buttons */}
          {!hasSidebar && <MobileMenu appMode={false} />}
        </div>
      </div>
    </header>
  );
}
