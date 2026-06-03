import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '@/types/event';
import { getEventsForDate, isSameDay } from '@/utils/eventHelpers';
import { clsx } from 'clsx';

interface EventCalendarProps {
  events: Event[];
  onSelectDate?: (date: Date, dayEvents: Event[]) => void;
  selectedDate?: Date | null;
}

const WEEKDAY_KEYS = ['event.calendarDaySun', 'event.calendarDayMon', 'event.calendarDayTue', 'event.calendarDayWed', 'event.calendarDayThu', 'event.calendarDayFri', 'event.calendarDaySat'];

const EventCalendar: React.FC<EventCalendarProps> = ({ events, onSelectDate, selectedDate }) => {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = useState(() => new Date(2026, 4, 1));

  const { days, monthLabel } = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const label = viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    return { days: cells, monthLabel: label };
  }, [viewDate]);

  const today = new Date();

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t('event.calendarPrevMonth')}
        >
          <ChevronLeft size={20} />
        </button>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{monthLabel}</h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={t('event.calendarNextMonth')}
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-2">
        {WEEKDAY_KEYS.map((key) => (
          <motion.div
            key={key}
            className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {t(key)}
          </motion.div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${viewDate.getFullYear()}-${viewDate.getMonth()}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-0.5 sm:gap-1"
        >
          {days.map((date, i) => {
            if (!date) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const dayEvents = getEventsForDate(events, date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <motion.button
                key={date.toISOString()}
                type="button"
                onClick={() => onSelectDate?.(date, dayEvents)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={clsx(
                  'aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-start p-0.5 sm:p-1 text-sm font-medium transition-colors relative',
                  isSelected
                    ? 'bg-sda-blue text-white ring-2 ring-sda-gold'
                    : isToday
                      ? 'bg-sda-gold/20 text-sda-blue dark:text-sda-gold ring-1 ring-sda-gold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                )}
              >
                <span className="text-xs font-bold">{date.getDate()}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-full">
                    {dayEvents.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={clsx(
                          'w-1.5 h-1.5 rounded-full',
                          isSelected ? 'bg-white' : 'bg-sda-blue',
                          e.status === 'COMPLETED' && !isSelected && 'bg-slate-400',
                          e.status === 'ONGOING' && !isSelected && 'bg-green-500'
                        )}
                        title={e.title}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className={clsx('text-[8px]', isSelected ? 'text-white/80' : 'text-slate-400')}>
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default EventCalendar;
