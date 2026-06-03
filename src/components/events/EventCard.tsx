import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, MapPin, Users, ChevronRight } from 'lucide-react';
import { Event } from '@/types/event';
import { ROUTES } from '@/constants/routes';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatEventDate,
  getAttendancePercent,
} from '@/utils/eventHelpers';
import { clsx } from 'clsx';

interface EventCardProps {
  event: Event;
  index?: number;
  compact?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, index = 0, compact = false }) => {
  const { t } = useTranslation();
  const percent = getAttendancePercent(event);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      whileHover={{ y: -4 }}
      className={clsx(
        'group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-shadow',
        compact && 'flex flex-row'
      )}
    >
      {!compact && (
        <motion.div
          className="relative h-40 overflow-hidden"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={event.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=800&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-sda-blue/90 via-sda-blue/20 to-transparent"
            initial={{ opacity: 0.7 }}
            whileHover={{ opacity: 0.85 }}
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', CATEGORY_COLORS[event.category])}>
              {CATEGORY_LABELS[event.category]}
            </span>
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider', STATUS_COLORS[event.status])}>
              {STATUS_LABELS[event.status]}
            </span>
          </div>
        </motion.div>
      )}

      <motion.div
        className={clsx('p-5 space-y-3', compact && 'flex-1 flex flex-col justify-center')}
        layout
      >
        {compact && (
          <motion.div
            className="flex gap-2 mb-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', STATUS_COLORS[event.status])}>
              {STATUS_LABELS[event.status]}
            </span>
          </motion.div>
        )}

        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-sda-blue dark:group-hover:text-sda-gold transition-colors line-clamp-2">
          {event.title}
        </h3>

        {!compact && (
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-sda-blue shrink-0" />
            <span className="truncate">{formatEventDate(event.startDate, event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-sda-gold shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="pt-2">
          <motion.div
            className="flex justify-between text-xs font-bold mb-1"
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
          >
            <span className="flex items-center text-slate-600 dark:text-slate-300">
              <Users size={12} className="mr-1" />
              {event.currentAttendees}
              {event.maxAttendees ? ` / ${event.maxAttendees}` : ''} {t('event.cardRegistered')}
            </span>
            {event.maxAttendees && <span className="text-sda-blue">{percent}%</span>}
          </motion.div>
          {event.maxAttendees && (
            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-sda-blue to-sda-gold rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ delay: 0.2 + index * 0.05, duration: 0.6 }}
              />
            </div>
          )}
        </div>

        <Link
          to={ROUTES.EVENT_DETAILS.replace(':id', event.id)}
          className="inline-flex items-center text-sm font-bold text-sda-blue hover:text-sda-blue-dark dark:text-sda-gold transition-colors py-2 -ml-2 px-2"
        >
          {t('event.cardViewDetails')} <ChevronRight size={16} className="ml-0.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </motion.article>
  );
};

export default EventCard;
