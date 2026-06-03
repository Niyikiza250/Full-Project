import React from 'react';
import { Users, Church, Calendar, UserPlus, Megaphone, Bell, FileText, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const DistrictLeaderDashboard: React.FC = () => {

  const statsCards = [
    { label: 'Total Churches', value: '12', icon: <Church className="text-sda-blue" />, desc: 'In district' },
    { label: 'Church Leaders', value: '12', icon: <UserPlus className="text-sda-gold" />, desc: 'Active pastors' },
    { label: 'Total Members', value: '8,400', icon: <Users className="text-indigo-600" />, desc: 'Total membership' },
    { label: 'Total Events', value: '18', icon: <Calendar className="text-green-600" />, desc: 'This quarter' },
  ];

  const churchStatus = [
    { name: 'Kigali Central Church', pastor: 'Pastor Eric', status: 'success', report: 'Submitted' },
    { name: 'Remera SDA Church', pastor: 'Pastor Jean', status: 'success', report: 'Submitted' },
    { name: 'Kacyiru SDA Church', pastor: 'Pastor Marie', status: 'pending', report: 'Pending' },
    { name: 'Kimihurura SDA Church', pastor: 'Pastor Samuel', status: 'success', report: 'Submitted' },
  ];

  return (
    <div className="space-y-4">
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
        {/* Church Compliance */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'Church Reports'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Weekly report submission status'}</p>
            </div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {churchStatus.map((church, i) => (
              <div key={i} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{church.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{church.pastor}</p>
                </div>
                <div className="text-right">
                  {church.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">
                      <CheckCircle size={10} /> {church.report}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full uppercase">
                      <Clock size={10} /> {church.report}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            <Link to={ROUTES.CHURCHES} className="flex items-center gap-3 p-3 rounded-xl bg-sda-blue text-white text-xs font-bold hover:opacity-90 transition-all">
              <Church size={16} /> {'Manage Churches'}
            </Link>
            <Link to={ROUTES.CHURCH_LEADERS} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <UserPlus size={16} /> {'Manage Leaders'}
            </Link>
            <Link to={ROUTES.EVENTS} className="flex items-center gap-3 p-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Calendar size={16} /> {'Create Events'}
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
