import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Edit,
  Loader2,
  Building2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useEvent } from '@/hooks/useEvents';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  formatEventDate,
  getAttendancePercent,
} from '@/utils/eventHelpers';
import EventTimeline from '@/components/events/EventTimeline';
import AttendancePanel from '@/components/events/AttendancePanel';

const EventDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { data: event, isLoading } = useEvent(id || '');

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sda-blue" size={48} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="font-bold text-slate-600">{t('event.detailsNotFound')}</p>
        <Link to={ROUTES.EVENTS} className="text-sda-blue font-bold mt-4 inline-block">
          {t('event.backToEvents')}
        </Link>
      </div>
    );
  }

  const percent = getAttendancePercent(event);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.EVENTS)}
          className="text-slate-500 hover:text-sda-blue flex items-center font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('event.viewAllEvents')}
        </button>
        {isAdmin && (
          <Link
            to={ROUTES.EVENT_EDIT.replace(':id', event.id)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-sm hover:border-sda-blue transition-colors"
          >
            <Edit size={16} />
            {t('event.editEvent')}
          </Link>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden h-56 md:h-72 shadow-xl"
      >
        <img
          src={event.imageUrl || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1200'}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sda-blue via-sda-blue/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', CATEGORY_COLORS[event.category])}>
              {CATEGORY_LABELS[event.category]}
            </span>
            <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full uppercase', STATUS_COLORS[event.status])}>
              {STATUS_LABELS[event.status]}
            </span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-white/80 mt-2 max-w-2xl text-sm md:text-base line-clamp-2">{event.description}</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <InfoChip icon={<Calendar size={18} />} label={t('event.detailsWhen')} value={formatEventDate(event.startDate, event.endDate)} />
            <InfoChip icon={<MapPin size={18} />} label={t('event.detailsWhere')} value={event.location} />
            <InfoChip icon={<Building2 size={18} />} label={t('event.detailsOrganizer')} value={event.organizer} />
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <h2 className="font-bold text-lg mb-4">{t('event.detailsAbout')}</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{event.description}</p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <h2 className="font-bold text-lg mb-6">{t('event.detailsTimeline')}</h2>
            <EventTimeline entries={event.timeline} />
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <h3 className="font-bold flex items-center gap-2 mb-4">
              <Users size={18} className="text-sda-blue" />
              {t('event.detailsCapacity')}
            </h3>
            <p className="text-3xl font-bold">
              {event.currentAttendees}
              {event.maxAttendees && (
                <span className="text-lg text-slate-400 font-normal"> / {event.maxAttendees}</span>
              )}
            </p>
            {event.maxAttendees && (
              <motion.div className="mt-4">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sda-blue to-sda-gold"
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">{t('event.detailsCapacityFilled', { percent })}</p>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <AttendancePanel
              event={event}
              canRegister={event.status !== 'COMPLETED' && event.status !== 'CANCELLED'}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoChip: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex gap-3">
    <motion.div className="p-2 bg-sda-blue/10 text-sda-blue rounded-xl h-fit">{icon}</motion.div>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 break-words">{value}</p>
    </div>
  </div>
);

export default EventDetails;
