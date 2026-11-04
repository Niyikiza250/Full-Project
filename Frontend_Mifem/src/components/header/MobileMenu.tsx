import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { setPreferredLanguage } from '@/lib/language';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { useThemeStore } from '@/store/useThemeStore';
import {
  MoreVertical,
  X,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  Home,
  Newspaper,
  BookMarked,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MifemLogo } from '@/components/ui/MifemLogo';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'rw', label: 'RW' },
  { code: 'fr', label: 'FR' },
];

const MOBILE_NAV_LINKS = [
  { key: 'home', icon: Home, href: ROUTES.HOME },
  { key: 'newsUpdates', icon: Newspaper, href: '/#achievements' },
  { key: 'sabbathSchool', icon: BookOpen, href: 'https://sabbath-school.adventech.io/kin', external: true },
  { key: 'readBible', icon: BookMarked, href: 'https://bibiliya.com/', external: true },
  { key: 'visitUnion', icon: ExternalLink, href: 'https://www.rumadventist.org/', sameTab: true },
];

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE));
}

function trapFocus(e: KeyboardEvent, container: HTMLElement) {
  if (e.key !== 'Tab') return;
  const items = getFocusable(container);
  if (!items.length) { e.preventDefault(); return; }
  const first = items[0];
  const last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault(); last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault(); first.focus();
  }
}

interface MobileMenuProps {
  /** If true, shows app-mode nav (no public links) */
  appMode?: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ appMode: _appMode = false }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { close(); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        toggleRef.current && !toggleRef.current.contains(e.target as Node)
      ) { close(); }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open || !drawerRef.current) return;
    const handleKey = (e: KeyboardEvent) => trapFocus(e, drawerRef.current!);
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const itemClass = 'flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-xl transition-all';
  const iconClass = 'w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0';

  return (
    <>
      <button
        ref={toggleRef}
        type="button"
        aria-label={open ? t('sidebar.closeMenu') : t('common.menu')}
        aria-expanded={open}
        className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl transition-colors text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <MoreVertical size={22} />
      </button>

      {/* Overlay */}
      <motion.div
        className="fixed inset-0 bg-black z-40 md:hidden"
        initial={false}
        animate={{ opacity: open ? 0.4 : 0 }}
        onClick={close}
        aria-hidden
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      />

      {/* Drawer */}
      <motion.div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('common.menu')}
        className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] z-50 overflow-y-auto shadow-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10 md:hidden"
        initial={false}
        animate={{ x: open ? 0 : '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ pointerEvents: open ? 'auto' : 'none' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <MifemLogo size="sm" iconOnly />
            <span className="text-[11px] font-medium truncate text-sda-blue dark:text-sda-gold">
              {t('mifem.brandName')}
            </span>
          </div>
          <button
            type="button"
            aria-label={t('sidebar.closeMenu')}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors text-slate-600 dark:text-white/70 hover:text-slate-900"
            onClick={close}
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 py-4">
          {/* User info if authenticated */}
          {user && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sda-blue to-sda-blue-dark flex items-center justify-center font-bold text-white text-sm">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <span className="text-[10px] font-extrabold text-sda-blue dark:text-sda-gold uppercase">
                    {getTranslatedRoleLabel(user.role, t)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Nav links (available in both public and app modes) */}
          <ul className="flex flex-col gap-1 mb-4">
            {MOBILE_NAV_LINKS.map((link) => (
              <li key={link.key}>
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${itemClass} text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`}
                    onClick={close}
                  >
                    <link.icon className={iconClass} />
                    {t('nav.' + link.key)}
                    <ExternalLink size={12} className="ml-auto text-slate-400" />
                  </a>
                ) : 'sameTab' in link ? (
                  <a
                    href={link.href}
                    className={`${itemClass} text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`}
                    onClick={close}
                  >
                    <link.icon className={iconClass} />
                    {t('nav.' + link.key)}
                  </a>
                ) : link.href.startsWith('/#') ? (
                  <a
                    href={link.href}
                    className={`${itemClass} text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5`}
                    onClick={(e) => {
                      close();
                      if (pathname === '/') {
                        e.preventDefault();
                        const el = document.getElementById(link.href.slice(2));
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    <link.icon className={iconClass} />
                    {t('nav.' + link.key)}
                  </a>
                ) : (
                  <Link
                    to={link.href}
                    className={`${itemClass} ${
                      pathname === link.href
                        ? 'bg-sda-gold/20 text-sda-gold'
                        : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                    onClick={close}
                  >
                    <link.icon className={iconClass} />
                    {t('nav.' + link.key)}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <hr className="my-4 border-slate-200 dark:border-white/10" />

          {/* Authenticated section */}
          {isAuthenticated ? (
            <div className="flex flex-col gap-1">
              <Link to={ROUTES.PROFILE} onClick={close} className={itemClass + ' text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'}>
                <User className={iconClass} />
                {t('nav.myProfile')}
              </Link>
              <Link to={ROUTES.DASHBOARD} onClick={close} className="flex items-center gap-3 w-full rounded-xl bg-sda-gold px-5 py-3.5 text-sm font-bold text-sda-blue transition-all">
                <LayoutDashboard size={18} />
                {t('nav.dashboard')}
              </Link>
              {(user?.role === 'SUPER_ADMIN' || user?.role === 'FIELD_ADMINISTRATOR') && (
                <Link to={ROUTES.SETTINGS} onClick={close} className={itemClass + ' text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5'}>
                  <Settings className={iconClass} />
                  {t('nav.settings')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => { close(); logout(); }}
                className={itemClass + ' text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'}
              >
                <LogOut className="w-5 h-5 shrink-0" />
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to={ROUTES.LOGIN} onClick={close} className="flex items-center gap-3 w-full rounded-xl border border-slate-200 dark:border-white/20 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                <LogIn size={18} />
                {t('nav.login')}
              </Link>
              <Link to={ROUTES.REGISTER} onClick={close} className="flex items-center gap-3 w-full rounded-xl bg-sda-gold px-5 py-3.5 text-sm font-bold text-sda-blue transition-all">
                <UserPlus size={18} />
                {t('nav.register')}
              </Link>
            </div>
          )}

          <hr className="my-4 border-slate-200 dark:border-white/10" />

          {/* Language switcher */}
          <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => {
                  void i18n.changeLanguage(lang.code);
                  setPreferredLanguage(lang.code as 'en' | 'rw' | 'fr');
                }}
                className={cn(
                  'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                  i18n.language === lang.code
                    ? 'bg-white dark:bg-slate-950 text-sda-blue dark:text-sda-gold shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-white/70 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
              {t('header.toggleTheme')}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default MobileMenu;
