import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ComposedChart,
} from 'recharts';
import PageHeader from '@/components/ui/PageHeader';
import ExportMenu from '@/components/ui/ExportMenu';
import { useAttendanceTrends } from '@/hooks/useAttendanceModule';
import { useAuthStore } from '@/store/useAuthStore';
import { MOCK_FIELDS } from '@/data/enterpriseMocks';
import { FIELD_REPORTS } from '@/data/fieldReports';
import type { FieldReport } from '@/data/fieldReports';

function aggregateReports(ids: string[]): FieldReport {
  const reports = ids.map((id) => FIELD_REPORTS[id]).filter(Boolean);
  if (reports.length === 0) return FIELD_REPORTS.FR1;
  if (reports.length === 1) return reports[0];

  const parseNum = (s: string) => parseInt(s.replace(/,/g, ''), 10);

  const total = (key: 'membership' | 'baptisms' | 'groups' | 'volunteers') =>
    reports.reduce((sum, r) => sum + parseNum(r[key]), 0).toLocaleString();

  const avgDelta = (key: 'membershipDelta' | 'baptismsDelta' | 'groupsDelta' | 'volunteersDelta') => {
    const vals = reports.map((r) => parseFloat(r[key].replace(/[+%]/g, '')));
    const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
    const first = reports[0][key];
    return first.includes('%') ? `+${avg}%` : `+${Math.round(parseFloat(avg))}`;
  };

  const sumMinistry = reports[0].ministry.map((_, i) => ({
    name: reports[0].ministry[i].name,
    value: reports.reduce((sum, r) => sum + r.ministry[i].value, 0),
  }));

  const sumCombined = reports[0].combined.map((_, i) => ({
    m: reports[0].combined[i].m,
    worship: reports.reduce((sum, r) => sum + r.combined[i].worship, 0),
    ss: reports.reduce((sum, r) => sum + r.combined[i].ss, 0),
    outreach: reports.reduce((sum, r) => sum + r.combined[i].outreach, 0),
  }));

  return {
    membership: total('membership'),
    baptisms: total('baptisms'),
    groups: total('groups'),
    volunteers: total('volunteers'),
    membershipDelta: avgDelta('membershipDelta'),
    baptismsDelta: avgDelta('baptismsDelta'),
    groupsDelta: avgDelta('groupsDelta'),
    volunteersDelta: avgDelta('volunteersDelta'),
    districts: reports.reduce((s, r) => s + r.districts, 0),
    churches: reports.reduce((s, r) => s + r.churches, 0),
    ministry: sumMinistry,
    combined: sumCombined,
  };
}

const ReportsAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: trends = [] } = useAttendanceTrends();
  const [note, setNote] = useState<string | null>(null);

  const canViewAll = user?.role === 'SUPER_ADMIN' || user?.role === 'UNION_LEADER';
  const defaultField = user?.fieldId || 'FR1';
  const [selectedField, setSelectedField] = useState<string>(
    canViewAll ? 'all' : defaultField
  );

  const effectiveField = canViewAll ? selectedField : defaultField;

  const report = useMemo(() => {
    if (effectiveField === 'all') {
      return aggregateReports(Object.keys(FIELD_REPORTS));
    }
    return FIELD_REPORTS[effectiveField] || FIELD_REPORTS.FR1;
  }, [effectiveField]);

  const handleExport = (fmt: 'csv' | 'pdf' | 'xlsx') => {
    setNote(`${fmt.toUpperCase()} — ${t('reports.exportSection')} (demo)`);
    setTimeout(() => setNote(null), 2200);
  };

  const kpiCards = [
    { k: 'kpiMembership', v: report.membership, d: report.membershipDelta },
    { k: 'kpiBaptisms', v: report.baptisms, d: report.baptismsDelta },
    { k: 'kpiGroups', v: report.groups, d: report.groupsDelta },
    { k: 'kpiVolunteers', v: report.volunteers, d: report.volunteersDelta },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <PageHeader
        title={t('reports.title')}
        subtitle={t('reports.subtitle')}
        actions={
          <div className="flex items-center gap-3">
            {canViewAll && (
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              >
                <option value="all">Union-wide (All Fields)</option>
                {MOCK_FIELDS.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            {!canViewAll && (
              <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
                {MOCK_FIELDS.find((f) => f.id === effectiveField)?.name || 'Field'}
              </span>
            )}
            <ExportMenu onExport={handleExport} />
          </div>
        }
      />
      {note && (
        <div role="status" className="rounded-xl bg-sda-gold/20 px-4 py-2 text-center text-sm font-medium text-sda-blue">
          {note}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, i) => (
          <motion.div
            key={card.k}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{t(`reports.${card.k}` as 'reports.kpiMembership')}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{card.v}</p>
            <p className="mt-1 text-xs font-bold text-green-600">{card.d}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{t('reports.ministryTitle')}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.ministry} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#003087" radius={[0, 8, 8, 0]} name="Participants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{t('reports.trendTitle')}</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.combined}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="m" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="worship" stroke="#003087" strokeWidth={2} dot />
                <Line type="monotone" dataKey="ss" stroke="#C5B358" strokeWidth={2} dot />
                <Line type="monotone" dataKey="outreach" stroke="#002261" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 font-bold text-slate-900 dark:text-white">{t('attendance.trendTitle')}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="period" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} domain={[60, 100]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="right" dataKey="participants" fill="#C5B358" name="Participants" radius={[4, 4, 0, 0]} />
              <Line yAxisId="left" type="monotone" dataKey="rate" stroke="#003087" strokeWidth={2} name="Rate %" dot />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};

export default ReportsAnalytics;