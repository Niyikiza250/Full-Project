import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Bell, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Dashboard role sub-components
import { SuperAdminDashboard } from './dashboard/SuperAdminDashboard';
import { UnionLeaderDashboard } from './dashboard/UnionLeaderDashboard';
import { FieldAdministratorDashboard } from './dashboard/FieldAdministratorDashboard';
import { FieldLeaderDashboard } from './dashboard/FieldLeaderDashboard';
import { DistrictLeaderDashboard } from './dashboard/DistrictLeaderDashboard';
import { ChurchLeaderDashboard } from './dashboard/ChurchLeaderDashboard';
import { MinistryLeaderDashboard } from './dashboard/MinistryLeaderDashboard';
import { MemberDashboard } from './dashboard/MemberDashboard';
import { VolunteerDashboard } from './dashboard/VolunteerDashboard';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();

  const getDashboardComponent = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return <SuperAdminDashboard />;
      case 'UNION_LEADER':
        return <UnionLeaderDashboard />;
      case 'FIELD_ADMINISTRATOR':
        return <FieldAdministratorDashboard />;
      case 'FIELD_LEADER':
        return <FieldLeaderDashboard />;
      case 'DISTRICT_LEADER':
        return <DistrictLeaderDashboard />;
      case 'CHURCH_LEADER':
        return <ChurchLeaderDashboard />;
      case 'MINISTRY_LEADER':
        return <MinistryLeaderDashboard />;
      case 'MEMBER':
        return <MemberDashboard />;
      case 'VOLUNTEER':
      default:
        return <VolunteerDashboard />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 max-w-7xl mx-auto"
    >
      {/* Dashboard Top Heading */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold-light border border-sda-blue/10 dark:border-sda-gold/20 uppercase tracking-wider mb-2">
            <Sparkles size={10} /> {t('dashboard.activeSessionPortal')}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-xs font-semibold">
            {t('dashboard.welcome', { name: user?.name ?? 'User' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.COMMUNICATION}
            className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-sda-blue dark:hover:text-sda-gold hover:shadow-xs transition-all relative focus:outline-none focus-visible:ring-2 focus-visible:ring-sda-blue"
          >
            <Bell size={18} aria-hidden="true" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900" aria-hidden="true" />
            <span className="sr-only">{t('dashboard.notifications')}</span>
          </Link>
          <div className="text-xs font-extrabold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </div>
      </header>

      {/* Main Dashboard Render */}
      <section className="mt-2">
        {getDashboardComponent()}
      </section>
    </motion.div>
  );
};

export default Dashboard;
