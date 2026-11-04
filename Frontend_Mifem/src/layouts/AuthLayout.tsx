import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/useThemeStore';
import { ROUTES } from '@/constants/routes';
import { MifemLogo } from '@/components/ui/MifemLogo';
import { AdventistLogo } from '@/components/common/AdventistLogo';
import { Sun, Moon, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { setPreferredLanguage } from '@/lib/language';
import { BibleVerseSlideshow } from '@/components/auth/BibleVerseSlideshow';
import { BlueCardDisplay } from '@/components/dashboard/BlueCardDisplay';

const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const setLang = (lng: 'en' | 'rw' | 'fr') => {
    void i18n.changeLanguage(lng);
    setPreferredLanguage(lng);
    setLangDropdownOpen(false);
  };

  return (
    <div
      className="min-h-screen lg:h-screen bg-[#BCC6CE] relative flex items-center justify-center p-3 sm:p-4 lg:p-6 lg:overflow-hidden"
      style={{ backgroundColor: '#BCC6CE', minHeight: '100vh' }}
    >
      {/* Subtle ambient background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-sda-blue/5 rounded-full blur-2xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-white/25 rounded-full blur-2xl" />
      </div>

      {/* Centered card */}
      <div className="relative z-10 w-full max-w-6xl lg:h-full rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-slate-300/80 dark:border-slate-800 bg-white dark:bg-slate-900 my-auto">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 min-h-16 flex items-center justify-between gap-3 px-4 sm:px-6 shadow-sm">
        <div className="flex items-center gap-2 min-w-0">
          <Link to={ROUTES.HOME} className="hover:opacity-80 transition-opacity">
            <span className="hidden sm:block">
              <MifemLogo size="md" />
            </span>
            <span className="block sm:hidden">
              <MifemLogo size="sm" iconOnly />
            </span>
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
                    <button
                      type="button"
                      onClick={() => setLang('fr')}
                      className={cn(
                        'w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between',
                        i18n.language === 'fr' ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {t('common.french')}
                      {i18n.language === 'fr' && <span className="w-1.5 h-1.5 rounded-full bg-sda-blue dark:bg-sda-gold" />}
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
          <div className="hidden sm:block w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <AdventistLogo />
        </div>
      </header>

      {/* Main content — two panels */}
      <div className="flex flex-col lg:flex-row lg:flex-1 lg:min-h-0 relative z-10">
        {/* Left Blue Panel */}
        <div className="w-full lg:w-[42%] lg:h-full lg:shrink-0 lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar flex flex-col justify-between p-4 lg:p-5 relative bg-gradient-to-br from-sda-blue via-[#002266] to-[#001144]">
          {/* Decorative branding layer */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '26px 26px' }} />
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full border border-white/10" />
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/5" />
            <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-sda-gold/10 blur-3xl" />
            <div className="absolute bottom-8 -left-24 w-80 h-80 rounded-full border border-sda-gold/10" />
            <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-sda-gold/40" />
            <div className="absolute top-1/4 left-1/2 w-1.5 h-1.5 rounded-full bg-white/25" />
          </div>

          {/* Inspirational slider */}
          <div className="relative z-10 my-3 lg:my-4">
            <BibleVerseSlideshow />
          </div>

          {/* Mission card */}
          <div className="relative z-10">
            <BlueCardDisplay hideDetails />
          </div>
        </div>

        {/* Right White Panel */}
        <div className="w-full lg:w-[58%] lg:h-full lg:flex-1 lg:min-h-0 bg-white dark:bg-slate-900 lg:overflow-y-auto lg:overflow-x-hidden no-scrollbar">
          <div className="p-4 sm:p-5 lg:p-6 max-w-4xl mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default AuthLayout;
