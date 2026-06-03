import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/useThemeStore';
import { ROUTES } from '@/constants/routes';
import { MifemLogo } from '@/components/ui/MifemLogo';
import { Sun, Moon, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { setPreferredLanguage } from '@/lib/language';

const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const setLang = (lng: 'en' | 'rw') => {
    void i18n.changeLanguage(lng);
    setPreferredLanguage(lng);
    setLangDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Link to={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
            <MifemLogo size="md" />
          </Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              aria-label={t('header.changeLanguage')}
            >
              <Languages size={18} />
              <span className="text-xs font-bold uppercase hidden md:inline-block">
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
                    className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
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
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label={t('header.toggleTheme')}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <div className="relative bg-sda-blue p-6 sm:p-8 text-white text-center overflow-hidden">
            <img
              src="/upload/MIFEM-2.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="relative z-10">
              <MifemLogo size="xl" className="justify-center mb-4" iconOnly />
              <h1 className="text-2xl font-bold tracking-tight">{t('app.name')}</h1>
              <p className="text-sda-gold-light text-sm mt-1">{t('auth.authLayoutSubtitle')}</p>
            </div>
          </div>
          <div className="p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
