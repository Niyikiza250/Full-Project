import React from 'react';
import { ClipboardList, CheckCircle, Calendar, TrendingUp, Bell, UserCheck, Clock, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const VolunteerDashboard: React.FC = () => {

  const statsCards = [
    { label: 'Assigned Tasks', value: '6', icon: <ClipboardList className="text-sda-blue" />, desc: 'Current tasks' },
    { label: 'Completed Tasks', value: '12', icon: <CheckCircle className="text-green-600" />, desc: 'This month' },
    { label: 'Participated Events', value: '8', icon: <Calendar className="text-indigo-600" />, desc: 'Total events' },
    { label: 'Engagement Score', value: '85%', icon: <TrendingUp className="text-sda-gold" />, desc: 'Active engagement' },
  ];

  const tasks = [
    { title: 'Setup sound system for Sabbath', event: 'Youth Sabbath', due: 'Jun 1, 2026', status: 'Pending' },
    { title: 'Prepare refreshments', event: 'Community Outreach', due: 'Jun 5, 2026', status: 'In Progress' },
    { title: 'Coordinate transportation', event: 'Field Trip', due: 'Jun 10, 2026', status: 'Pending' },
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
        {/* Assigned Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'My Tasks'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Tasks assigned to you'}</p>
            </div>
          </div>
          <div className="space-y-3">
            {tasks.map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <div className="flex items-start gap-3">
                  <div className={`p-1.5 rounded-lg ${task.status === 'In Progress' ? 'bg-amber-100 dark:bg-amber-950/30 text-amber-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    {task.status === 'In Progress' ? <Clock size={14} /> : <ClipboardList size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{task.title}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{task.event} · Due: {task.due}</p>
                  </div>
                </div>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                  task.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : 'bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            <Link to={ROUTES.TASKS} className="flex items-center gap-3 p-3 rounded-xl bg-sda-blue text-white text-xs font-bold hover:opacity-90 transition-all">
              <ClipboardList size={16} /> {'View Tasks'}
            </Link>
            <Link to={ROUTES.EVENTS} className="flex items-center gap-3 p-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Calendar size={16} /> {'Join Events'}
            </Link>
            <Link to={ROUTES.PARTICIPATION_HISTORY} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:opacity-90 transition-all">
              <Clock size={16} /> {'View History'}
            </Link>
            <Link to={ROUTES.PROFILE} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700 text-white text-xs font-bold hover:opacity-90 transition-all">
              <UserCheck size={16} /> {'Update Profile'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
