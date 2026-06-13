import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { useNotificationReadStore } from '@/store/useNotificationReadStore';
import { useHierarchicalAnnouncements } from '@/hooks/useCommunicationModule';
import { AdventistLogo } from '@/components/common/AdventistLogo';
import { useLogoStore } from '@/store/useLogoStore';
import { Sun, Moon, Bell, Menu, LogIn, UserPlus } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import NavLinks from './NavLinks';
import LanguageSwitcher from './LanguageSwitcher';
import UserDropdown from './UserDropdown';
import FieldAdminQuickAccess from './FieldAdminQuickAccess';
import MobileMenu from './MobileMenu';

interface MainHeaderProps {
  hasSidebar?: boolean;
  onOpenSidebar?: () => void;
}

export default function MainHeader({ hasSidebar = false, onOpenSidebar }: MainHeaderProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();
  const { logoDataUrl } = useLogoStore();

  const { data: announcements = [] } = useHierarchicalAnnouncements();
  const { isRead } = useNotificationReadStore();
  const unreadCount = announcements.filter((a) => !isRead(a.id)).length;

  return (
    <header className="fixed top-0 left-0 right-0 z-40 h-[72px] bg-white dark:bg-slate-950 border-b border-[#E2E8F0] dark:border-slate-800 shadow-sm">
      <div className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10">
        {/* ========== LEFT: Logo + Brand ========== */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
          {hasSidebar && onOpenSidebar && (
            <button
              type="button"
              onClick={onOpenSidebar}
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors shrink-0"
              aria-label={t('header.openSidebar')}
            >
              <Menu size={22} />
            </button>
          )}

          <Link
            to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.HOME}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity shrink-0"
          >
            <div className="relative shrink-0 w-[42px] h-[42px] sm:w-[48px] sm:h-[48px] rounded-lg overflow-hidden">
              <img
                src={logoDataUrl || '/upload/MIFEM_logo.png'}
                alt={t('mifem.logoAlt')}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="hidden sm:block text-[18px] lg:text-[20px] font-semibold text-[#0D47A1] dark:text-sda-gold leading-tight max-w-[280px] lg:max-w-none">
              {t('mifem.brandName')}
            </span>
          </Link>
        </div>

        {/* ========== CENTER: Navigation ========== */}
        {!hasSidebar && <NavLinks />}

        {/* ========== RIGHT: Actions ========== */}
        <div className="flex items-center gap-3 sm:gap-4 lg:gap-5 shrink-0">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {isAuthenticated ? (
            <>
              {user?.role === 'FIELD_ADMINISTRATOR' && (
                <div className="hidden lg:block">
                  <FieldAdminQuickAccess />
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => navigate(ROUTES.COMMUNICATION)}
                  className="p-2 rounded-lg text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
                  aria-label={t('header.toggleNotifications')}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  )}
                </button>
              </div>

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
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[15px] font-semibold text-white bg-[#0D47A1] rounded-lg hover:bg-[#0B2E78] shadow-sm transition-all duration-200"
              >
                <UserPlus size={18} />
                {t('nav.register')}
              </Link>
            </>
          )}

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {/* SDA Church Logo */}
          <div className="hidden lg:block">
            <AdventistLogo compact />
          </div>

          {/* Mobile Menu Trigger */}
          <MobileMenu appMode={hasSidebar} />
        </div>
      </div>
    </header>
  );
}
