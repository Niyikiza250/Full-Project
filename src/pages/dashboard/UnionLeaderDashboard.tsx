import React from 'react';
import {
  Users, Map, Church, Calendar, Megaphone, BarChart3, FileText,
  Activity, TrendingUp, ArrowUpRight, Award
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const FIELD_DATA = [
  { field: 'Central Field', churches: 15, members: 15400, baptisms: 1250 },
  { field: 'Western Field', churches: 12, members: 12800, baptisms: 1100 },
  { field: 'Eastern Field', churches: 10, members: 9200, baptisms: 740 },
  { field: 'Southern Field', churches: 8, members: 6400, baptisms: 520 },
  { field: 'Northern Field', churches: 6, members: 4454, baptisms: 350 },
];

export const UnionLeaderDashboard: React.FC = () => {

  const statsCards = [
    { label: 'Total Fields', value: '5', icon: <Map className="text-sda-blue" />, desc: 'Active fields' },
    { label: 'Total Districts', value: '17', icon: <Map className="text-sda-gold" />, desc: 'Under union' },
    { label: 'Total Churches', value: '58', icon: <Church className="text-indigo-600" />, desc: 'Organized churches' },
    { label: 'Total Members', value: '48,250', icon: <Users className="text-green-600" />, desc: 'Total union membership' },
    { label: 'Total Events', value: '234', icon: <Calendar className="text-amber-600" />, desc: 'Union-wide events' },
    { label: 'Total Announcements', value: '89', icon: <Megaphone className="text-red-500" />, desc: 'Published' },
  ];

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
            <p className="text-[9px] text-slate-400 font-medium mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Comparison Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'Field Comparison'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Members & baptisms by field'}</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FIELD_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="field" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                <Bar dataKey="members" name={'Total Members'} fill="#003087" radius={[4, 4, 0, 0]} />
                <Bar dataKey="baptisms" name={'Baptisms'} fill="#C5B358" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            <Link to={ROUTES.FIELDS} className="flex items-center gap-3 p-3 rounded-xl bg-sda-blue text-white text-xs font-bold hover:opacity-90 transition-all">
              <Map size={16} /> {'View Fields'}
            </Link>
            <Link to={ROUTES.MINISTRY_ACTIVITIES} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Activity size={16} /> {'Monitor Ministries'}
            </Link>
            <Link to={ROUTES.ANNOUNCEMENTS} className="flex items-center gap-3 p-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Megaphone size={16} /> {'Send Announcements'}
            </Link>
            <Link to={ROUTES.REPORTS} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <FileText size={16} /> {'Generate Reports'}
            </Link>
            <Link to={ROUTES.ANALYTICS} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700 text-white text-xs font-bold hover:opacity-90 transition-all">
              <BarChart3 size={16} /> {'View Analytics'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
