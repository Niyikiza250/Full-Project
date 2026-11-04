import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { UserPlus, Loader2, CheckCircle2, XCircle, User } from 'lucide-react';
import { Event } from '@/types/event';
import { useRegisterAttendance } from '@/hooks/useEvents';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';

interface AttendancePanelProps {
  event: Event;
  canRegister?: boolean;
}

const AttendancePanel: React.FC<AttendancePanelProps> = ({ event, canRegister = true }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const registerMutation = useRegisterAttendance();
  const [guestName, setGuestName] = useState('');

  const isRegistered = user
    ? event.attendance.some((a) => a.memberId === user.id && a.status === 'PRESENT')
    : false;

  const handleRegister = async () => {
    const memberId = user?.id || `guest-${Date.now()}`;
    const memberName = user?.name || guestName.trim();
    if (!memberName) return;

    await registerMutation.mutateAsync({
      eventId: event.id,
      memberId,
      memberName,
    });
    setGuestName('');
  };

  const showForm =
    canRegister &&
    (event.status === 'UPCOMING' || event.status === 'ONGOING') &&
    !isRegistered;

  return (
    <div className="space-y-6">
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-sda-blue/5 to-sda-gold/5 dark:from-sda-blue/10 dark:to-sda-gold/10 p-5 rounded-2xl border border-sda-blue/20"
        >
          <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <UserPlus size={18} className="text-sda-blue" />
            {t('event.attendanceRegister')}
          </h4>
          {user ? (
            <p className="text-sm text-slate-500 mb-4">
              {t('event.attendanceRegisterPrefix')} <span className="font-bold text-slate-700 dark:text-slate-300">{user.name}</span>
            </p>
          ) : (
            <input
              type="text"
              placeholder={t('event.attendanceNamePlaceholder')}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full mb-4 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-sda-blue"
            />
          )}
          <button
            type="button"
            onClick={handleRegister}
            disabled={registerMutation.isPending || (!user && !guestName.trim())}
            className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {registerMutation.isPending ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <CheckCircle2 size={18} />
                {t('event.attendanceConfirm')}
              </>
            )}
          </button>
        </motion.div>
      )}

      {isRegistered && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800"
        >
          <CheckCircle2 size={24} />
          <div>
            <p className="font-bold">{t('event.attendanceRegistered')}</p>
            <p className="text-sm opacity-80">{t('event.attendanceSeeYou')}</p>
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h4 className="font-bold text-lg mb-4 flex items-center justify-between">
          <span>{t('event.attendanceHeading', { count: event.attendance.length })}</span>
          <span className="text-sm font-normal text-slate-500">
            {t('event.attendanceTotal', { count: event.currentAttendees })}
          </span>
        </h4>

        {event.attendance.length === 0 ? (
          <p className="text-sm text-slate-500 italic">{t('event.attendanceNoRegistrations')}</p>
        ) : (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
            <AnimatePresence>
              {event.attendance.map((record, i) => (
                <motion.li
                  key={record.memberId}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
                >
                  <motion.div
                    className="flex items-center gap-3"
                    whileHover={{ x: 2 }}
                  >
                    <div className="w-9 h-9 rounded-full bg-sda-blue/10 flex items-center justify-center text-sda-blue">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{record.memberName}</p>
                      {record.registeredAt && (
                        <p className="text-[10px] text-slate-400 uppercase font-medium">
                          {new Date(record.registeredAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </motion.div>
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2 py-0.5 rounded-full uppercase',
                      record.status === 'PRESENT'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : record.status === 'EXCUSED'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                    )}
                  >
                    {record.status === 'PRESENT' ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={10} /> {t('event.attendancePresent')}
                      </span>
                    ) : record.status === 'EXCUSED' ? (
                      t('event.attendanceExcused')
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle size={10} /> {t('event.attendanceAbsent')}
                      </span>
                    )}
                  </span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.div>
    </div>
  );
};

export default AttendancePanel;
