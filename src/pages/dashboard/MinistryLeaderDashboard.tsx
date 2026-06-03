import React, { useMemo } from 'react';
import { Heart, Calendar, UserCheck, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { MOCK_MEMBERS } from '@/utils/mockData';
import { MOCK_CHURCHES } from '@/data/enterpriseMocks';

export const MinistryLeaderDashboard: React.FC = () => {
  const { user } = useAuthStore();

  const userChurchName = useMemo(() => {
    if (!user?.churchId) return undefined;
    return MOCK_CHURCHES.find(c => c.id === user.churchId)?.name;
  }, [user?.churchId]);

  const memberCount = useMemo(() => {
    if (!userChurchName) return '—';
    return MOCK_MEMBERS.filter(m => m.churchName === userChurchName).length.toString();
  }, [userChurchName]);

  const statsCards = [
    { label: 'Total Members', value: memberCount, icon: <Users className="text-sda-blue" />, desc: userChurchName ? `Members in ${userChurchName}` : 'All members' },
    { label: 'Total Events', value: '12', icon: <Calendar className="text-sda-blue" />, desc: 'This month' },
    { label: 'Attendance Records', value: '89%', icon: <UserCheck className="text-green-600" />, desc: 'Average attendance' },
    { label: 'Active Volunteers', value: '48', icon: <Heart className="text-red-500" />, desc: 'Active volunteers' },
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
        {/* Upcoming Events */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'Upcoming Events'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Events scheduled this month'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Youth Outreach Program', date: 'Jun 15, 2026', volunteers: 12, status: 'Planned' },
              { title: 'Community Health Campaign', date: 'Jun 22, 2026', volunteers: 8, status: 'Planned' },
              { title: 'Music Ministry Workshop', date: 'Jul 5, 2026', volunteers: 15, status: 'Planned' },
            ].map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{event.title}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{event.date} · {event.volunteers} volunteers</p>
                </div>
                <span className="text-[9px] font-extrabold bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold px-2 py-0.5 rounded-full">
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            <Link to={ROUTES.EVENTS} className="flex items-center gap-3 p-3 rounded-xl bg-sda-blue text-white text-xs font-bold hover:opacity-90 transition-all">
              <Calendar size={16} /> {'Organize Events'}
            </Link>
            <Link to={ROUTES.MEMBERS} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Users size={16} /> {'View Members'}
            </Link>
            <Link to={ROUTES.REPORTS} className="flex items-center gap-3 p-3 rounded-xl bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <FileText size={16} /> {'Generate Reports'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
