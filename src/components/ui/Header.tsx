import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import { ROUTES } from '@/constants/routes';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Sun,
  Moon,
  Languages,
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Megaphone,
  LogIn,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationReadStore } from '@/store/useNotificationReadStore';
import { useHierarchicalAnnouncements } from '@/hooks/useCommunicationModule';
import { MifemLogo } from './MifemLogo';
import { setPreferredLanguage } from '@/lib/language';

interface HeaderProps {
  setIsMobileOpen?: (open: boolean) => void;
  hasSidebarLayout?: boolean;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  setIsMobileOpen,
  hasSidebarLayout = false,
  isSidebarCollapsed = false,
}) => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const setLang = (lng: 'en' | 'rw') => {
    void i18n.changeLanguage(lng);
    setPreferredLanguage(lng);
    setLangDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  const { data: announcements = [] } = useHierarchicalAnnouncements();
  const { isRead, markRead } = useNotificationReadStore();


  const unreadAnnouncements = announcements.filter((a) => !isRead(a.id));
  const unreadCount = unreadAnnouncements.length;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 z-40 min-h-14 sm:min-h-16 border-b border-slate-200 bg-white/80 px-2 sm:px-4 md:px-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80'
      )}
    >
      <div className="flex min-h-14 sm:min-h-16 items-center justify-between gap-1 sm:gap-2">
      {/* Left side: Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-1 sm:gap-2 min-w-0 shrink">
        {setIsMobileOpen && (
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1 sm:p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            aria-label={t('header.openSidebar')}
          >
            <Menu size={18} />
          </button>
        )}

        <Link to={ROUTES.DASHBOARD} className="hover:opacity-80 transition-opacity shrink-0">
          <MifemLogo size="sm" className="sm:hidden" />
          <MifemLogo size="md" className="hidden sm:flex lg:hidden" />
          <MifemLogo size="lg" className="hidden lg:flex" />
        </Link>
      </div>

      {/* Right side Actions */}
      <div className="flex items-center gap-0.5 md:gap-1.5 lg:gap-3 shrink-0">
        {/* Language Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
            className="p-1 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
            aria-label={t('header.changeLanguage')}
          >
            <Languages size={16} />
            <span className="text-[10px] sm:text-xs font-bold uppercase hidden sm:inline-block">
              {i18n.language}
            </span>
          </button>
          <AnimatePresence>
            {langDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-32 sm:w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between',
                      i18n.language === 'en' ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {t('common.english')}
                    {i18n.language === 'en' && <span className="w-1.5 h-1.5 rounded-full bg-sda-blue dark:bg-sda-gold" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('rw')}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between',
                      i18n.language === 'rw' ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-700 dark:text-slate-300'
                    )}
                  >
                    {t('common.kinyarwanda')}
                    {i18n.language === 'rw' && <span className="w-1.5 h-1.5 rounded-full bg-sda-blue dark:bg-sda-gold" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {user ? (
          <>
            {/* Notifications Icon with live data */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-1 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label={t('header.toggleNotifications')}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                )}
              </button>
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-72 sm:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/55 dark:bg-slate-800/40">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {t('communication.tabNotifications')}
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] bg-red-100 dark:bg-red-950/60 text-red-650 dark:text-red-400 font-black px-2 py-0.5 rounded-full">
                            {unreadCount} {t('common.unread').toLowerCase()}
                          </span>
                        )}
                      </div>
                      <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                        {announcements.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                            {t('communication.noNotifications')}
                          </div>
                        ) : (
                          announcements.slice(0, 5).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => {
                                markRead(item.id);
                                setNotificationsOpen(false);
                                navigate(ROUTES.COMMUNICATION);
                              }}
                              className={cn(
                                'p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-150 cursor-pointer flex gap-3 items-start',
                                !isRead(item.id) ? 'bg-sda-blue/5 dark:bg-sda-gold/5' : ''
                              )}
                            >
                              <div className={cn(
                                'mt-1 shrink-0 p-1.5 rounded-lg',
                                item.priority === 'URGENT' ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-500' :
                                item.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-500' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-500'
                              )}>
                                <Megaphone size={13} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={cn(
                                  'text-xs leading-snug',
                                  !isRead(item.id) ? 'font-black text-slate-900 dark:text-white' : 'font-medium text-slate-650 dark:text-slate-450'
                                )}>
                                  {item.title}
                                </p>
                                <span className="text-[9px] font-bold text-slate-400 block mt-1">
                                  {item.author} · {new Date(item.publishedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {!isRead(item.id) && (
                                <span className="w-1.5 h-1.5 bg-sda-blue dark:bg-sda-gold rounded-full shrink-0 mt-1.5" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate(ROUTES.COMMUNICATION);
                          }}
                          className="text-[10px] font-black text-sda-blue dark:text-sda-gold-light hover:underline"
                        >
                          {t('dashboard.viewEvents')}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </>
        ) : (
          <>
            <Link
              to={ROUTES.LOGIN}
              className="hidden sm:flex px-3 py-1.5 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-sda-blue transition-colors items-center gap-1"
            >
              <LogIn size={13} />
              {t('auth.submit')}
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="hidden sm:flex px-3 py-1.5 bg-sda-blue text-white rounded-xl text-[11px] sm:text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-md shadow-sda-blue/20 items-center gap-1"
            >
              <UserPlus size={13} />
              {t('home.register')}
            </Link>
          </>
        )}

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t('header.toggleTheme')}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        <span className="w-px h-4 sm:h-6 bg-slate-200 dark:bg-slate-800 shrink-0" />

        {/* User Info / Profile Dropdown */}
        <div className="relative">
          {user ? (
            <>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 text-left hover:opacity-90 focus:outline-none"
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-sda-blue to-sda-blue-dark flex items-center justify-center font-bold text-white shadow-sm border border-sda-blue/10 overflow-hidden text-[10px] sm:text-sm">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={t('header.avatarAlt')} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || t('header.userFallback').charAt(0)
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
                    {user?.name || t('header.userFallback')}
                  </p>
                  <span className="text-[9px] font-extrabold bg-sda-gold/20 text-sda-blue dark:text-sda-gold-light dark:bg-sda-gold/10 px-1.5 py-0.5 rounded uppercase tracking-wider block mt-0.5 w-max">
                    {getTranslatedRoleLabel(user?.role, t)}
                  </span>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="p-3 border-b border-slate-100 dark:border-slate-800 md:hidden">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user?.name}</p>
                        <span className="text-[9px] font-extrabold text-sda-blue dark:text-sda-gold uppercase mt-1 inline-block">
                          {getTranslatedRoleLabel(user?.role, t)}
                        </span>
                      </div>
                      <div className="p-1">
                        <Link
                          to={ROUTES.PROFILE}
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <User size={14} className="text-slate-400" />
                          {t('nav.profile')}
                        </Link>
                        {user?.role === 'SUPER_ADMIN' && (
                          <Link
                            to={ROUTES.SETTINGS}
                            onClick={() => setProfileDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Settings size={14} className="text-slate-400" />
                            {t('nav.settings')}
                          </Link>
                        )}
                      </div>
                      <div className="border-t border-slate-100 dark:border-slate-800 p-1">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <LogOut size={14} />
                          {t('common.logout')}
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="flex items-center gap-0.5 sm:hidden">
               <Link to={ROUTES.LOGIN} className="p-1.5 text-slate-500 hover:text-sda-blue transition-colors">
                  <LogIn size={16} />
               </Link>
            </div>
          )}
        </div>
      </div>
      </div>
    </header>
  );
};
