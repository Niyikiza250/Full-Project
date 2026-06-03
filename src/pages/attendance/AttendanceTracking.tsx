import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import ExportMenu from '@/components/ui/ExportMenu';
import LoadingBlock from '@/components/ui/LoadingBlock';
import EmptyState from '@/components/ui/EmptyState';
import QRCheckInPanel from '@/components/attendance/QRCheckInPanel';
import {
  useAttendanceSessions,
  useAttendanceCheckins,
  useAttendanceTrends,
  useDigitalCheckIn,
  exportAttendanceCsv,
} from '@/hooks/useAttendanceModule';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import { UserCheck, CheckCircle2 } from 'lucide-react';

const AttendanceTracking: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const [sessionId, setSessionId] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('');
  const [memberId, setMemberId] = useState('');
  const [memberName, setMemberName] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const { data: sessions = [], isLoading: loadSessions } = useAttendanceSessions();
  const { data: trends = [] } = useAttendanceTrends();
  const { data: checkins = [], isLoading: loadCheckins } = useAttendanceCheckins(sessionId || undefined);
  const checkInMutation = useDigitalCheckIn();

  React.useEffect(() => {
    if (!sessionId && sessions.length) setSessionId(sessions[0].id);
  }, [sessions, sessionId]);

  React.useEffect(() => {
    if (user) {
      setMemberId(user.id);
      setMemberName(user.name);
    }
  }, [user]);

  const activeSession = sessions.find((s) => s.id === sessionId);

  const filteredCheckins = useMemo(() => {
    if (!methodFilter) return checkins;
    return checkins.filter((c) => c.method === methodFilter);
  }, [checkins, methodFilter]);

  const participation = useMemo(() => {
    if (!activeSession || !activeSession.expected) return 0;
    return Math.round((activeSession.present / activeSession.expected) * 100);
  }, [activeSession]);

  const handleExport = (format: 'csv' | 'pdf' | 'xlsx') => {
    if (format === 'csv') {
      const blob = new Blob([exportAttendanceCsv(checkins, sessions)], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'attendance-checkins.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else {
      setToast(`${format.toUpperCase()} ${t('common.export')} — demo`);
      setTimeout(() => setToast(null), 2500);
    }
  };

  const submitCheckIn = async () => {
    if (!sessionId || !memberId.trim() || !memberName.trim()) return;
    await checkInMutation.mutateAsync({
      sessionId,
      memberId: memberId.trim(),
      memberName: memberName.trim(),
      method: 'MANUAL',
    });
    setToast(t('common.success'));
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title={t('attendance.title')}
        subtitle={t('attendance.subtitle')}
        actions={<ExportMenu onExport={handleExport} disabled={!checkins.length} />}
      />

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-900"
        >
          {toast}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-3 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">{t('attendance.sessions')}</h2>
          {loadSessions ? (
            <LoadingBlock label={t('common.loading')} />
          ) : (
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSessionId(s.id)}
                    className={cn(
                      'w-full rounded-xl border px-4 py-3 text-left text-sm transition-all',
                      sessionId === s.id
                        ? 'border-sda-blue bg-sda-blue/5 ring-2 ring-sda-blue/20'
                        : 'border-slate-200 bg-white hover:border-sda-blue/40 dark:border-slate-800 dark:bg-slate-900'
                    )}
                  >
                    <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {new Date(s.date).toLocaleString()} · {s.fieldName}
                    </span>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-sda-blue">
                      <UserCheck size={12} aria-hidden />
                      {s.present}/{s.expected}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-6 lg:col-span-2">
          {activeSession && (
            <div className="grid gap-6 md:grid-cols-2">
              <QRCheckInPanel token={activeSession.qrToken} />
              {isAdmin && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <h3 className="font-bold text-slate-900 dark:text-white">{t('attendance.digitalCheckIn')}</h3>
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500">{t('attendance.memberId')}</label>
                      <input
                        value={memberId}
                        onChange={(e) => setMemberId(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sda-blue dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-slate-500">{t('attendance.memberName')}</label>
                      <input
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sda-blue dark:border-slate-700 dark:bg-slate-800"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={submitCheckIn}
                      disabled={checkInMutation.isPending}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-sda-blue py-3 text-sm font-bold text-white transition hover:bg-sda-blue-dark disabled:opacity-50"
                    >
                      {checkInMutation.isPending ? t('common.loading') : t('attendance.checkIn')}
                      <CheckCircle2 size={18} aria-hidden />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('attendance.analytics')}</h3>
              <div className="text-sm font-bold text-sda-blue">
                {t('attendance.participationRate')}: {participation}%
              </div>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} domain={[60, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="rate" name="%" stroke="#003087" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-bold text-slate-900 dark:text-white">{t('attendance.checkIns')}</h3>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800"
                aria-label={t('common.filter')}
              >
                <option value="">{t('common.all')}</option>
                <option value="QR">{t('attendance.methodQr')}</option>
                <option value="MANUAL">{t('attendance.methodManual')}</option>
                <option value="KIOSK">{t('attendance.methodKiosk')}</option>
              </select>
            </div>
            {loadCheckins ? (
              <LoadingBlock label={t('common.loading')} className="min-h-[160px]" />
            ) : filteredCheckins.length === 0 ? (
              <EmptyState title={t('attendance.emptyCheckins')} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500 dark:border-slate-700">
                      <th className="py-2 pr-4 font-bold">{t('attendance.tableMember')}</th>
                      <th className="py-2 pr-4 font-bold">{t('attendance.tableMethod')}</th>
                      <th className="py-2 font-bold">{t('attendance.tableTime')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCheckins.map((row) => (
                      <tr key={row.id} className="border-b border-slate-100 dark:border-slate-800">
                        <td className="py-2 pr-4 font-medium">{row.memberName}</td>
                        <td className="py-2 pr-4">{row.method}</td>
                        <td className="py-2 text-slate-500">{new Date(row.checkedInAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-slate-500">{t('attendance.exportHint')}</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;
