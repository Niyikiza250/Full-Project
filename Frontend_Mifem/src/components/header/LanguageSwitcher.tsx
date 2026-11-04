import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';
import { setPreferredLanguage } from '@/lib/language';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { code: 'en', labelKey: 'common.english' },
  { code: 'rw', labelKey: 'common.kinyarwanda' },
  { code: 'fr', labelKey: 'common.french' },
] as const;

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);

  const setLang = (code: string) => {
    void i18n.changeLanguage(code);
    setPreferredLanguage(code as 'en' | 'rw' | 'fr');
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-[#2D3748] dark:text-slate-300 hover:text-[#0D47A1] dark:hover:text-sda-gold transition-colors"
        aria-label={t('header.changeLanguage')}
      >
        <Globe size={18} />
        <span className="text-[15px] font-semibold uppercase">{i18n.language}</span>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLang(lang.code)}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-between',
                    i18n.language === lang.code ? 'text-[#0D47A1] dark:text-sda-gold' : 'text-[#2D3748] dark:text-slate-300'
                  )}
                >
                  {t(lang.labelKey)}
                  {i18n.language === lang.code && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0D47A1]" />
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
