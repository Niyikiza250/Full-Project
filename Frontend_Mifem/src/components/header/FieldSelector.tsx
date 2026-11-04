import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_FIELDS } from '@/data/enterpriseMocks';
import { ChevronDown, Map } from 'lucide-react';

interface FieldSelectorProps {
  selectedFieldId: string;
  onFieldChange: (fieldId: string) => void;
}

export default function FieldSelector({ selectedFieldId, onFieldChange }: FieldSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedName = selectedFieldId
    ? MOCK_FIELDS.find(f => f.id === selectedFieldId)?.name || t('common.all')
    : t('common.all');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-sda-blue/10 dark:bg-sda-blue/20 px-3 py-1.5 text-xs font-bold text-sda-blue dark:text-sda-gold hover:bg-sda-blue/20 dark:hover:bg-sda-blue/30 transition-all whitespace-nowrap"
      >
        <Map size={14} />
        <span className="max-w-[140px] truncate">{selectedName}</span>
        <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                {t('member.filterField')}
              </span>
            </div>
            <div className="p-1 max-h-80 overflow-y-auto">
              <button
                type="button"
                onClick={() => { onFieldChange(''); setOpen(false); }}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-left ${!selectedFieldId ? 'text-sda-blue dark:text-sda-gold bg-sda-blue/5 dark:bg-sda-gold/10' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Map size={14} className="shrink-0 text-slate-400" />
                {t('common.all')}
              </button>
              {MOCK_FIELDS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => { onFieldChange(f.id); setOpen(false); }}
                  className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors text-left ${selectedFieldId === f.id ? 'text-sda-blue dark:text-sda-gold bg-sda-blue/5 dark:bg-sda-gold/10' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Map size={14} className="shrink-0 text-slate-400" />
                  {f.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
