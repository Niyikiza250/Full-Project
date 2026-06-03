import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Play, CheckCircle2, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface EventStats {
  total: number;
  upcoming: number;
  ongoing: number;
  completed: number;
  totalAttendees: number;
}

interface EventStatsCardsProps {
  stats: EventStats;
}

const cards = [
  { key: 'upcoming' as const, labelKey: 'event.statsUpcoming', icon: Calendar, color: 'text-sda-gold', bg: 'bg-sda-gold/10' },
  { key: 'ongoing' as const, labelKey: 'event.statsOngoing', icon: Play, color: 'text-sda-blue', bg: 'bg-sda-blue/10' },
  { key: 'completed' as const, labelKey: 'event.statsCompleted', icon: CheckCircle2, color: 'text-slate-500', bg: 'bg-slate-100 dark:bg-slate-800' },
  { key: 'totalAttendees' as const, labelKey: 'event.statsRegistrations', icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
];

const EventStatsCards: React.FC<EventStatsCardsProps> = ({ stats }) => {
  const { t } = useTranslation();
  const values: Record<string, number> = {
    upcoming: stats.upcoming,
    ongoing: stats.ongoing,
    completed: stats.completed,
    totalAttendees: stats.totalAttendees,
  };

  return (
    <motion.div
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { transition: { staggerChildren: 0.08 } },
      }}
    >
      {cards.map(({ key, labelKey, icon: Icon, color, bg }, i) => (
        <motion.div
          key={key}
          variants={{
            hidden: { opacity: 0, y: 16 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ y: -2 }}
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className={clsx('p-2.5 rounded-xl', bg)}>
              <Icon size={20} className={color} />
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">{t(labelKey)}</span>
          </div>
          <motion.p
            className="text-3xl font-bold mt-3 tracking-tight text-slate-900 dark:text-white"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.05 }}
          >
            {values[key].toLocaleString()}
          </motion.p>
          {key !== 'totalAttendees' && (
            <p className="text-xs text-slate-500 mt-1">{t('event.statsOfEvents', { count: stats.total })}</p>
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default EventStatsCards;
