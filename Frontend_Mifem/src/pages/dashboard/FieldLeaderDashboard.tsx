import React from 'react';
import { Users, Map, Church, Calendar, Megaphone, FileText } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { MOCK_FIELDS } from '@/data/enterpriseMocks';
import { FIELD_REPORTS } from '@/data/fieldReports';

const DISTRICT_DATA = [
  { district: 'Kigali City', churches: 12, members: 8400 },
  { district: 'Bugesera', churches: 8, members: 5200 },
  { district: 'Rwamagana', churches: 6, members: 3800 },
  { district: 'Gicumbi', churches: 7, members: 4100 },
  { district: 'Musanze', churches: 5, members: 2900 },
];

export const FieldLeaderDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const fieldId = user?.fieldId || 'FR1';
  const report = FIELD_REPORTS[fieldId] || FIELD_REPORTS.FR1;
  const fieldName = MOCK_FIELDS.find((f) => f.id === fieldId)?.name || 'Field';

  const statsCards = [
    { label: 'Total Districts', value: String(report.districts), icon: <Map className="text-sda-blue" />, desc: 'Active districts' },
    { label: 'Total Churches', value: String(report.churches), icon: <Church className="text-sda-gold" />, desc: 'Organized churches' },
    { label: 'Total Members', value: report.membership, icon: <Users className="text-green-600" />, desc: `Total membership (${fieldName})` },
    { label: 'Total Baptisms', value: report.baptisms, icon: <Calendar className="text-indigo-600" />, desc: `+${report.baptismsDelta.replace('+', '')} this year` },
  ];

  return (
    <div className="space-y-4">
      {/* Field Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-sda-blue/10 rounded-xl">
          <Map size={20} className="text-sda-blue dark:text-sda-gold" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">{fieldName}</h1>
          <p className="text-[10px] text-slate-400 font-medium">Field Leader Dashboard</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-slate-400">{stat.label}</span>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{stat.icon}</div>
            </div>
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{stat.value}</div>
            <p className="text-[10px] text-slate-400 font-medium mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* District Comparison Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'District Metrics'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Members & churches by district'}</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="district" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="churches" name="Churches" fill="#003087" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            <Link to={ROUTES.DISTRICTS} className="flex items-center gap-3 p-3 rounded-xl bg-sda-blue text-white text-xs font-bold hover:opacity-90 transition-all">
              <Map size={16} /> {'Manage Districts'}
            </Link>
            <Link to={ROUTES.EVENTS} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Calendar size={16} /> {'Create Events'}
            </Link>
            <Link to={ROUTES.ANNOUNCEMENTS} className="flex items-center gap-3 p-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Megaphone size={16} /> {'Send Announcements'}
            </Link>
            <Link to={ROUTES.REPORTS} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <FileText size={16} /> {'View Reports'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
