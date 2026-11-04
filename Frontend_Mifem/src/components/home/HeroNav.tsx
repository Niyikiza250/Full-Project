import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MoreVertical, LogIn, UserPlus, LayoutDashboard, Languages, X } from 'lucide-react';
import { MifemLogo } from '@/components/ui/MifemLogo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { setPreferredLanguage } from '@/lib/language';
import { cn } from '@/lib/utils';
import { AdventistLogo } from '@/components/common/AdventistLogo';

const DESKTOP_LINKS = [
  { labelKey: 'home', href: ROUTES.HOME },
  { labelKey: 'services', href: '#services' },
  { labelKey: 'contact', href: '#contact' },
];

const MOBILE_LINKS = [
  { labelKey: 'home', href: ROUTES.HOME },
  { labelKey: 'services', href: '#services' },
  { labelKey: 'contact', href: '#contact' },
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
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

const HeroNav: React.FC = () => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const setLang = (lng: 'en' | 'rw') => {
    void i18n.changeLanguage(lng);
    setPreferredLanguage(lng);
    setLangDropdownOpen(false);
  };

  const closeLangDropdown = useCallback(() => setLangDropdownOpen(false), []);
  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? 'text-sda-gold'
        : 'text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white'
    }`;

  useEffect(() => {
    if (!mobileOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMobile(); toggleRef.current?.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(e.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target as Node)
      ) {
        closeMobile();
      }
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [mobileOpen, closeMobile]);

  useEffect(() => {
    if (!mobileOpen || !drawerRef.current) return;
    const handleKey = (e: KeyboardEvent) => trapFocus(e, drawerRef.current!);
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [mobileOpen]);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLangDropdown();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [langDropdownOpen, closeLangDropdown]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-slate-950 shadow-sm border-b border-gray-100 dark:border-white/10`}
    >
      <nav className="w-full px-6 sm:px-8 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => {
              navigate(ROUTES.HOME);
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setMobileOpen(false);
              setLangDropdownOpen(false);
            }}
            className="hover:opacity-80 transition-opacity shrink-0 outline-none cursor-pointer"
          >
            <MifemLogo size="sm" iconOnly className="sm:hidden" />
            <MifemLogo size="md" className="hidden sm:flex" />
          </button>

          {/* Mobile compact title (only when logo is icon-only) */}
          <h1 className="sm:hidden text-[11px] font-medium truncate leading-tight flex-1 text-center px-2 min-w-0">
            {t('mifem.brandNameShort')}
          </h1>

          {/* Desktop links */}
          <ul className="hidden md:flex flex-1 items-center justify-center gap-8 lg:gap-12">
            {DESKTOP_LINKS.map((link) => (
              <li key={link.labelKey}>
                <a href={link.href} className={linkClass(link.href)}>
                  {t('nav.' + link.labelKey)}
                </a>
              </li>
            ))}
            <li>
              <a
                href="https://sabbath-school.adventech.io/kin"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium transition-colors text-slate-600 hover:text-slate-900 dark:text-white/70 dark:hover:text-white"
              >
                Sabbath School Lesson
              </a>
            </li>
          </ul>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-1.5 sm:p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
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
                    <div className="fixed inset-0 z-40" onClick={closeLangDropdown} />
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

            <ThemeToggle />

            {isAuthenticated ? (
              <Link
                to={ROUTES.DASHBOARD}
                className="inline-flex items-center gap-2 rounded-xl bg-sda-gold px-5 py-2.5 text-sm font-bold text-sda-blue shadow-md shadow-sda-gold/20 hover:shadow-lg hover:shadow-sda-gold/30 transition-all"
              >
                <LayoutDashboard size={16} />
                {t('nav.dashboard')}
              </Link>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/30 px-5 py-2.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all"
                >
                  <LogIn size={16} />
                  {t('nav.login')}
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="inline-flex items-center gap-2 rounded-xl bg-sda-gold px-5 py-2.5 text-sm font-bold text-sda-blue shadow-md shadow-sda-gold/20 hover:shadow-lg hover:shadow-sda-gold/30 transition-all"
                >
                  <UserPlus size={16} />
                  {t('nav.register')}
                </Link>
              </>
            )}
          </div>

          {/* SDA Logo + Mobile three-dot menu - right side */}
          <div className="flex items-center gap-4 shrink-0">
            <AdventistLogo compact />
            <button
              ref={toggleRef}
              type="button"
              aria-label={mobileOpen ? t('sidebar.closeMenu') : t('common.menu')}
              aria-expanded={mobileOpen}
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl transition-colors text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white"
              onClick={mobileOpen ? closeMobile : openMobile}
            >
              <MoreVertical size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer - always rendered, visibility toggles */}
      <div className="md:hidden">
        <motion.div
          className="fixed inset-0 bg-black z-40"
          initial={false}
          animate={{ opacity: mobileOpen ? 0.4 : 0 }}
          onClick={closeMobile}
          aria-hidden
          style={{ pointerEvents: mobileOpen ? 'auto' : 'none' }}
        />
        <motion.div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t('common.menu')}
          className="fixed top-0 right-0 bottom-0 w-72 max-w-[85vw] z-50 overflow-y-auto shadow-2xl bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-white/10"
          initial={false}
          animate={{ x: mobileOpen ? 0 : '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          style={{ pointerEvents: mobileOpen ? 'auto' : 'none' }}
        >
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <MifemLogo size="sm" iconOnly />
                  <span className="text-[11px] font-medium truncate text-sda-blue dark:text-sda-gold">
                    {t('mifem.brandNameShort')}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={t('sidebar.closeMenu')}
                  className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors text-slate-600 dark:text-white/70 hover:text-slate-900"
                  onClick={closeMobile}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 py-4">
                <ul className="flex flex-col gap-1">
                  {MOBILE_LINKS.map((link) => (
                    <li key={link.labelKey}>
                      {link.href.startsWith('#') ? (
                        <a
                          href={link.href}
                          className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            pathname === link.href
                              ? 'bg-sda-gold/20 text-sda-gold'
                              : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                          onClick={closeMobile}
                        >
                          {t('nav.' + link.labelKey)}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                            pathname === link.href
                              ? 'bg-sda-gold/20 text-sda-gold'
                              : 'text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                          }`}
                          onClick={closeMobile}
                        >
                          {t('nav.' + link.labelKey)}
                        </Link>
                      )}
                    </li>
                  ))}
                  <li>
                    <a
                      href="https://sabbath-school.adventech.io/kin"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-3 rounded-xl text-sm font-bold transition-all text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
                      onClick={closeMobile}
                    >
                      Sabbath School Lesson
                    </a>
                  </li>
                </ul>

                <hr className="my-4 border-slate-200 dark:border-white/10" />

                {isAuthenticated ? (
                  <Link
                    to={ROUTES.DASHBOARD}
                    className="flex items-center gap-3 w-full rounded-xl bg-sda-gold px-5 py-3.5 text-sm font-bold text-sda-blue transition-all"
                    onClick={closeMobile}
                  >
                    <LayoutDashboard size={18} />
                    {t('nav.dashboard')}
                  </Link>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to={ROUTES.LOGIN}
                      className="flex items-center gap-3 w-full rounded-xl border border-slate-200 dark:border-white/20 px-5 py-3.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      onClick={closeMobile}
                    >
                      <LogIn size={18} />
                      {t('nav.login')}
                    </Link>
                    <Link
                      to={ROUTES.REGISTER}
                      className="flex items-center gap-3 w-full rounded-xl bg-sda-gold px-5 py-3.5 text-sm font-bold text-sda-blue transition-all"
                      onClick={closeMobile}
                    >
                      <UserPlus size={18} />
                      {t('nav.register')}
                    </Link>
                  </div>
                )}

                <div className="mt-6 flex flex-col items-center gap-3">
                  {/* Mobile Language Switcher */}
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setLang('en')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                        i18n.language === 'en'
                          ? 'bg-white dark:bg-slate-950 text-sda-blue dark:text-sda-gold shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      )}
                    >
                      EN
                    </button>
                    <button
                      type="button"
                      onClick={() => setLang('rw')}
                      className={cn(
                        'px-3 py-1.5 text-xs font-bold rounded-lg transition-colors',
                        i18n.language === 'rw'
                          ? 'bg-white dark:bg-slate-950 text-sda-blue dark:text-sda-gold shadow-sm'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                      )}
                    >
                      RW
                    </button>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
            </motion.div>
      </div>
    </header>
  );
};

export default HeroNav;
