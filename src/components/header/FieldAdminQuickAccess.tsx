import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import {
  Users,
  Heart,
  Calendar,
  Hand,
  BarChart3,
  Megaphone,
  BookOpen,
  GraduationCap,
  FileText,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface QuickLink {
  labelKey: string;
  icon: LucideIcon;
  route: string;
}

const QUICK_LINKS: QuickLink[] = [
  { labelKey: 'fieldAdmin.members', icon: Users, route: ROUTES.MEMBERS },
  { labelKey: 'fieldAdmin.ministries', icon: Heart, route: ROUTES.MINISTRIES },
  { labelKey: 'fieldAdmin.events', icon: Calendar, route: ROUTES.EVENTS },
  { labelKey: 'fieldAdmin.volunteers', icon: Hand, route: ROUTES.VOLUNTEERS },
  { labelKey: 'fieldAdmin.reports', icon: BarChart3, route: ROUTES.REPORTS },
  { labelKey: 'fieldAdmin.communications', icon: Megaphone, route: ROUTES.COMMUNICATION },
  { labelKey: 'fieldAdmin.prayerRequests', icon: BookOpen, route: ROUTES.PRAYER_COUNSELING },
  { labelKey: 'fieldAdmin.training', icon: GraduationCap, route: ROUTES.TRAINING },
  { labelKey: 'fieldAdmin.documents', icon: FileText, route: ROUTES.DOCUMENTS },
];

export default function FieldAdminQuickAccess() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-sda-blue/10 dark:bg-sda-blue/20 px-3 py-1.5 text-xs font-bold text-sda-blue dark:text-sda-gold hover:bg-sda-blue/20 dark:hover:bg-sda-blue/30 transition-all"
      >
        <LayoutDashboard size={14} />
        {t('fieldAdmin.quickAccess')}
        <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  {t('fieldAdmin.fieldManagement')}
                </span>
              </div>
              <div className="p-1 max-h-80 overflow-y-auto">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.labelKey}
                      to={link.route}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Icon size={14} className="text-sda-blue dark:text-sda-gold shrink-0" />
                      {t(link.labelKey)}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
