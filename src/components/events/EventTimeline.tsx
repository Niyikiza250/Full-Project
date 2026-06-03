import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Clock } from 'lucide-react';
import { TimelineEntry } from '@/types/event';
import { clsx } from 'clsx';

interface EventTimelineProps {
  entries: TimelineEntry[];
  variant?: 'default' | 'compact';
}

const EventTimeline: React.FC<EventTimelineProps> = ({ entries, variant = 'default' }) => {
  const { t } = useTranslation();
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 italic py-4">{t('event.timelineEmpty')}</p>
    );
  }

  const sorted = [...entries].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="relative">
      <div
        className={clsx(
          'absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-sda-blue via-sda-gold to-slate-200 dark:to-slate-700',
          variant === 'compact' && 'left-[9px]'
        )}
      />
      <ul className="space-y-0">
        {sorted.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="relative pl-10 pb-8 last:pb-0"
          >
            <motion.div
              className="absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 bg-sda-blue shadow-md flex items-center justify-center"
              whileHover={{ scale: 1.15 }}
            >
              <span className="sr-only">{entry.time}</span>
            </motion.div>
            <motion.div
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-transparent hover:border-sda-blue/20 transition-colors"
              whileHover={{ x: 4 }}
            >
              <motion.div
                className="flex items-center gap-2 text-xs font-bold text-sda-blue dark:text-sda-gold uppercase tracking-wider mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.08 + 0.1 }}
              >
                <Clock size={12} />
                {entry.time}
              </motion.div>
              <h4 className="font-bold text-slate-900 dark:text-white">{entry.activity}</h4>
              {entry.description && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{entry.description}</p>
              )}
            </motion.div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default EventTimeline;
