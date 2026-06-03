import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Users, UserCheck, HeartHandshake, Award, Plus, Calendar, 
  MessageSquare, Settings, Play, ArrowRight, BellRing, Megaphone
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useHierarchicalAnnouncements } from '@/hooks/useCommunicationModule';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LeaderAchievementForm } from '@/components/leader/LeaderAchievementForm';

const CHECKIN_METHODS = [
  { name: 'QR Scan', value: 450 },
  { name: 'Manual Roster', value: 280 },
  { name: 'Self Kiosk', value: 120 },
];
const COLORS = ['#003087', '#C5B358', '#475569'];

export const ChurchLeaderDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { data: announcements, isLoading } = useHierarchicalAnnouncements();
  const latestAnnouncements = announcements?.slice(0, 3) || [];
  const { addToast } = useNotificationStore();

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <ChurchKPI title={'Baptized Members'} value={'850 Registered'} desc={'Kigali Central Church'} icon={<Users className="text-sda-blue" />} />
        <ChurchKPI title={'SS Class Attendance'} value={'680 Checked In'} desc={'Last Sabbath session'} icon={<UserCheck className="text-sda-gold" />} />
        <ChurchKPI title={'Visitors This Quarter'} value={'65 Guests'} desc={'Registered at lobby kiosk'} icon={<HeartHandshake className="text-indigo-600" />} />
        <ChurchKPI title={'Ministry Groups'} value={'12 Small Groups'} desc={'Active weekly assemblies'} icon={<Award className="text-green-600" />} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Check-in breakdown pie chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'Check-in Session Breakdown'}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{'Sabbath digital session tracking methods'}</p>
          </div>
          
          <div className="h-[180px] my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CHECKIN_METHODS} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value">
                  {CHECKIN_METHODS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {CHECKIN_METHODS.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                  <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: COLORS[index] }} />
                  {item.name}
                </div>
                <span className="font-bold text-slate-800 dark:text-white">{item.value} {'members'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">{'Local Administrator Panel'}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <LocalQuickButton label={'New Check-in'} icon={<Play size={16} />} color="bg-sda-blue text-white hover:bg-sda-blue-dark" />
            <LocalQuickButton label={'Add Member'} icon={<Plus size={16} />} color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" />
            <LocalQuickButton label={'New Event'} icon={<Calendar size={16} />} color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" />
          </div>
        </div>

        {/* Local Bulletins */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
              <Megaphone size={16} className="text-sda-blue dark:text-sda-gold" />
              {'Hierarchical Announcements'}
            </h3>
            <div className="space-y-3 text-xs leading-relaxed">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ) : latestAnnouncements.length === 0 ? (
                <p className="text-slate-400 italic">{'No recent announcements.'}</p>
              ) : (
                latestAnnouncements.map((a, idx) => (
                  <div key={a.id} className={`border-l-2 pl-3 py-0.5 ${
                    a.priority === 'URGENT' ? 'border-red-500' :
                    a.priority === 'HIGH' ? 'border-amber-500' :
                    'border-sda-blue dark:border-sda-gold'
                  }`}>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {a.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{a.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link to={ROUTES.COMMUNICATION} className="w-full mt-4 flex items-center justify-center gap-1 text-[11px] font-bold text-sda-blue dark:text-sda-gold hover:underline">
            {'View All Announcements'} <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <LeaderAchievementForm />
    </div>
  );
};

const ChurchKPI = ({ title, value, desc, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400">{title}</span>
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</div>
    <p className="text-[10px] text-slate-400 font-medium mt-1">{desc}</p>
  </div>
);

const LocalQuickButton = ({ label, icon, color }: any) => (
  <button className={`flex flex-col items-center justify-center p-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${color}`}>
    <div className="mb-2 p-1.5 bg-black/5 rounded-lg">
      {icon}
    </div>
    {label}
  </button>
);
