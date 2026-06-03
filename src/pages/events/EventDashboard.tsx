import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Search,
  Plus,
  Loader2,
  Filter,
  LayoutGrid,
  CalendarDays,
  List,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes';
import { EventCategory, EventStatus } from '@/types/event';
import { useEvents } from '@/hooks/useEvents';
import { CATEGORY_LABELS, getEventsForDate } from '@/utils/eventHelpers';
import EventCard from '@/components/events/EventCard';
import EventCalendar from '@/components/events/EventCalendar';

type TabId = 'ALL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED';
type ViewMode = 'grid' | 'calendar' | 'list';

const TABS: { id: TabId; labelKey: string; status?: EventStatus }[] = [
  { id: 'ALL', labelKey: 'event.tabAll' },
  { id: 'UPCOMING', labelKey: 'event.tabUpcoming', status: 'UPCOMING' },
  { id: 'ONGOING', labelKey: 'event.tabOngoing', status: 'ONGOING' },
  { id: 'COMPLETED', labelKey: 'event.tabCompleted', status: 'COMPLETED' },
];

const EventDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabId>('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EventCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { user } = useAuthStore();

  const { data: allEvents = [], isLoading } = useEvents();

  const filteredEvents = useMemo(() => {
    let list = [...allEvents];
    const tabStatus = TABS.find((t) => t.id === activeTab)?.status;
    if (tabStatus) list = list.filter((e) => e.status === tabStatus);
    if (categoryFilter) list = list.filter((e) => e.category === categoryFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.location.toLowerCase().includes(q)
      );
    }
    return list;
  }, [allEvents, activeTab, categoryFilter, search]);

  const calendarDayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(filteredEvents, selectedDate);
  }, [filteredEvents, selectedDate]);

  const displayEvents =
    viewMode === 'calendar' && selectedDate ? calendarDayEvents : filteredEvents;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full space-y-3"
    >
      <header className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <motion.h1
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {t('event.managementTitle')}
            </motion.h1>
            <motion.p
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="text-slate-500 dark:text-slate-400 mt-1"
            >
              {t('event.managementSubtitle')}
            </motion.p>
        </div>
        {user?.role === 'ADMIN' && (
          <Link
            to={ROUTES.EVENT_ADD}
            className="bg-sda-blue hover:bg-sda-blue-dark text-white px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 font-bold transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={20} />
            {t('event.createEvent')}
          </Link>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <motion.div
          className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedDate(null);
                }}
                className={clsx(
                  'px-4 py-2 rounded-xl text-sm font-bold transition-all',
                  activeTab === tab.id
                    ? 'bg-sda-blue text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                )}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(
              [
                { mode: 'grid' as const, icon: LayoutGrid, labelKey: 'event.viewGrid' },
                { mode: 'list' as const, icon: List, labelKey: 'event.viewList' },
                { mode: 'calendar' as const, icon: CalendarDays, labelKey: 'event.viewCalendar' },
              ] as const
            ).map(({ mode, icon: Icon, labelKey }) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-sda-blue'
                    : 'text-slate-500'
                )}
                title={t(labelKey)}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{t(labelKey)}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={t('event.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-sda-blue"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border font-bold text-sm transition-all',
              showFilters
                ? 'bg-sda-blue text-white border-sda-blue'
                : 'border-slate-200 dark:border-slate-700 text-slate-600'
            )}
          >
            <Filter size={18} />
            {t('common.filter')}
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('event.filterCategory')}</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as EventCategory | '')}
                  className="mt-1 w-full md:w-64 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue"
                >
                  <option value="">{t('event.allCategories')}</option>
                  {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {isLoading ? (
        <motion.div
          className="min-h-[320px] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="animate-spin text-sda-blue" size={48} />
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === 'calendar' ? (
            <motion.div
              key="calendar-view"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 xl:grid-cols-2 gap-6"
            >
              <EventCalendar
                events={filteredEvents}
                selectedDate={selectedDate}
                onSelectDate={(date) => setSelectedDate(date)}
              />
              <div className="space-y-4">
                <h3 className="font-bold text-lg">
                  {selectedDate
                    ? t('event.eventsOnDate', { date: selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) })
                    : t('event.selectDateHint')}
                </h3>
                {selectedDate && calendarDayEvents.length === 0 && (
                  <p className="text-slate-500 text-sm">{t('event.noEventsForDay')}</p>
                )}
                <div className={clsx('grid gap-4', viewMode === 'calendar' && 'grid-cols-1')}>
                  {calendarDayEvents.map((event, i) => (
                    <EventCard key={event.id} event={event} index={i} compact />
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${viewMode}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {displayEvents.length === 0 ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700"
                >
                  <CalendarDays className="mx-auto text-slate-300 mb-4" size={48} />
                  <p className="font-bold text-slate-600 dark:text-slate-400">{t('event.noEventsFound')}</p>
                  <p className="text-sm text-slate-500 mt-1">{t('event.noEventsHint')}</p>
                </motion.div>
              ) : (
                <div
                  className={clsx(
                    viewMode === 'list'
                      ? 'flex flex-col gap-4'
                      : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  )}
                >
                  {displayEvents.map((event, i) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={i}
                      compact={viewMode === 'list'}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
};

export default EventDashboard;
