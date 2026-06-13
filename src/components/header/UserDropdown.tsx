import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { getTranslatedRoleLabel } from '@/lib/roles';
import {
  User,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import RoleBasedMenu from './RoleBasedMenu';

export default function UserDropdown() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate(ROUTES.HOME);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-left hover:opacity-90 focus:outline-none"
      >
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-sda-blue to-sda-blue-dark flex items-center justify-center font-bold text-white shadow-sm border border-sda-blue/10 overflow-hidden text-xs sm:text-sm">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt={t('header.avatarAlt')} className="w-full h-full object-cover" />
          ) : (
            user.name?.charAt(0) || t('header.userFallback').charAt(0)
          )}
        </div>
        <div className="hidden md:block">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-tight">
            {user.name || t('header.userFallback')}
          </p>
          <span className="text-[9px] font-extrabold bg-sda-gold/20 text-sda-blue dark:text-sda-gold-light dark:bg-sda-gold/10 px-1.5 py-0.5 rounded uppercase tracking-wider block mt-0.5 w-max">
            {getTranslatedRoleLabel(user.role, t)}
          </span>
        </div>
        <ChevronDown size={14} className="text-slate-400 hidden md:block transition-transform" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 md:hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-none">{user.name}</p>
                <span className="text-[9px] font-extrabold text-sda-blue dark:text-sda-gold uppercase mt-1 inline-block">
                  {getTranslatedRoleLabel(user.role, t)}
                </span>
              </div>

              <div className="p-1">
                <Link
                  to={ROUTES.PROFILE}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <User size={14} className="text-slate-400 shrink-0" />
                  {t('nav.myProfile')}
                </Link>

                <RoleBasedMenu role={user.role} onClick={() => setOpen(false)} />

                {(user.role === 'SUPER_ADMIN' || user.role === 'FIELD_ADMINISTRATOR') && (
                  <Link
                    to={ROUTES.SETTINGS}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Settings size={14} className="text-slate-400 shrink-0" />
                    {t('nav.settings')}
                  </Link>
                )}

                <Link
                  to={ROUTES.COMMUNICATION}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Bell size={14} className="text-slate-400 shrink-0" />
                  {t('nav.notifications')}
                </Link>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 p-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                >
                  <LogOut size={14} />
                  {t('nav.logout')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
