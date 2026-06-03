import React from 'react';
import {
  Users, Shield, Church, Calendar, Heart, UserCheck, Megaphone,
  Activity, Settings, FileText, Bell, Database, Globe, Upload,
  BarChart3, ClipboardList, Eye, AlertTriangle, CheckCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { motion } from 'framer-motion';
import { useAnnouncements } from '@/hooks/useCommunicationModule';

const USER_GROWTH = [
  { month: 'Jan', users: 120, churches: 45 },
  { month: 'Feb', users: 145, churches: 48 },
  { month: 'Mar', users: 180, churches: 52 },
  { month: 'Apr', users: 220, churches: 55 },
  { month: 'May', users: 265, churches: 58 },
];

const RECENT_ACTIVITY = [
  { action: 'User Invited', target: 'john.doe@mifem.rw', time: '2 min ago', status: 'success' },
  { action: 'Role Updated', target: 'sarah@mifem.rw → UNION_LEADER', time: '15 min ago', status: 'info' },
  { action: 'System Backup', target: 'Full DB backup completed', time: '1 hr ago', status: 'success' },
  { action: 'Login Failed', target: 'unknown@example.com', time: '2 hrs ago', status: 'failed' },
  { action: 'Module Updated', target: 'Attendance module v2.1', time: '3 hrs ago', status: 'info' },
];

export const SuperAdminDashboard: React.FC = () => {

  const { data: announcements } = useAnnouncements();

  const statsCards = [
    { label: 'Total Users', value: '1,248', icon: <Users className="text-sda-blue" />, desc: '+12% this month' },
    { label: 'Active Users', value: '892', icon: <Activity className="text-green-600" />, desc: '71% active rate' },
    { label: 'Total Churches', value: '58', icon: <Church className="text-indigo-600" />, desc: '3 new this quarter' },
    { label: 'Total Events', value: '234', icon: <Calendar className="text-sda-gold" />, desc: '12 upcoming' },
    { label: 'Total Volunteers', value: '456', icon: <Heart className="text-red-500" />, desc: 'Across all ministries' },
    { label: 'Total Members', value: '48,250', icon: <UserCheck className="text-sda-blue" />, desc: 'Union-wide' },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: <Users size={16} />, to: ROUTES.ADMIN_USERS, color: 'bg-sda-blue text-white' },
    { label: 'Roles & Permissions', icon: <Shield size={16} />, to: ROUTES.ROLES_PERMISSIONS, color: 'bg-indigo-600 text-white' },
    { label: 'System Settings', icon: <Settings size={16} />, to: ROUTES.SYSTEM_SETTINGS, color: 'bg-slate-700 text-white' },
    { label: 'Audit Logs', icon: <ClipboardList size={16} />, to: ROUTES.AUDIT_LOGS, color: 'bg-amber-600 text-white' },
    { label: 'Analytics', icon: <BarChart3 size={16} />, to: ROUTES.ANALYTICS, color: 'bg-emerald-600 text-white' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {statsCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">{stat.icon}</div>
            </div>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white">{stat.value}</div>
            <p className="text-[9px] text-slate-400 font-medium mt-1">{stat.desc}</p>
          </div>
        ))}
      </div>

      {/* Announcements KPI Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-amber-600" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Announcements</h3>
          </div>
          <Link
            to={ROUTES.ANNOUNCEMENTS}
            className="flex items-center gap-1 text-[10px] font-bold text-sda-blue hover:underline"
          >
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-950/10 rounded-xl p-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
              <Megaphone size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{announcements?.length || 0}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-orange-50/50 dark:bg-orange-950/10 rounded-xl p-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/30 shrink-0">
              <AlertTriangle size={16} className="text-orange-500 dark:text-orange-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{(announcements || []).filter((a) => !a.isRead).length}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Unread</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-green-50/50 dark:bg-green-950/10 rounded-xl p-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/30 shrink-0">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{(announcements || []).filter((a) => a.isRead).length}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Read</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'User Growth'}</h3>
              <p className="text-[10px] text-slate-400 font-medium">{'Monthly user & church growth'}</p>
            </div>
          </div>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={USER_GROWTH}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="users" name="Users" fill="#003087" radius={[4, 4, 0, 0]} />
                <Bar dataKey="churches" name="Churches" fill="#C5B358" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Quick Actions'}</h3>
          <div className="space-y-3">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                to={action.to}
                className={`flex items-center gap-3 p-3 rounded-xl ${action.color} hover:opacity-90 transition-all text-xs font-bold`}
              >
                {action.icon}
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity / Audit Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <Activity size={16} className="text-slate-400" />
          {'Recent Activity'}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold">
                <th className="pb-3">{'Action'}</th>
                <th className="pb-3">{'Target'}</th>
                <th className="pb-3">{'Time'}</th>
                <th className="pb-3">{'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {RECENT_ACTIVITY.map((row, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                  <td className="py-3 font-bold text-slate-700 dark:text-slate-300">{row.action}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{row.target}</td>
                  <td className="py-3 text-slate-400">{row.time}</td>
                  <td className="py-3">
                    <span className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 text-[9px] font-extrabold ${
                      row.status === 'success' ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50' :
                      row.status === 'failed' ? 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50' :
                      'bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold border-sda-blue/10 dark:border-sda-gold/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};
