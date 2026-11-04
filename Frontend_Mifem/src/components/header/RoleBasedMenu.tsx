import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import type { UserRole } from '@/constants/routes';
import {
  LayoutDashboard,
  Building2,
  MapPin,
  Church,
  User,
  Hand,
  Shield,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface RoleMenuItem {
  role: UserRole;
  labelKey: string;
  icon: LucideIcon;
  route: string;
}

const ROLE_MENU_ITEMS: RoleMenuItem[] = [
  { role: 'SUPER_ADMIN', labelKey: 'nav.dashboard', icon: Shield, route: ROUTES.DASHBOARD },
  { role: 'UNION_LEADER', labelKey: 'nav.dashboard', icon: Building2, route: ROUTES.DASHBOARD },
  { role: 'FIELD_ADMINISTRATOR', labelKey: 'nav.dashboard', icon: LayoutDashboard, route: ROUTES.DASHBOARD },
  { role: 'FIELD_LEADER', labelKey: 'nav.dashboard', icon: MapPin, route: ROUTES.DASHBOARD },
  { role: 'DISTRICT_LEADER', labelKey: 'nav.dashboard', icon: Church, route: ROUTES.DASHBOARD },
  { role: 'CHURCH_LEADER', labelKey: 'nav.dashboard', icon: Church, route: ROUTES.DASHBOARD },
  { role: 'MINISTRY_LEADER', labelKey: 'nav.dashboard', icon: Hand, route: ROUTES.DASHBOARD },
  { role: 'MEMBER', labelKey: 'nav.dashboard', icon: User, route: ROUTES.DASHBOARD },
  { role: 'VOLUNTEER', labelKey: 'nav.dashboard', icon: Hand, route: ROUTES.DASHBOARD },
];

interface RoleBasedMenuProps {
  role: UserRole;
  onClick?: () => void;
}

export default function RoleBasedMenu({ role, onClick }: RoleBasedMenuProps) {
  const { t } = useTranslation();
  const item = ROLE_MENU_ITEMS.find((i) => i.role === role);
  if (!item) return null;

  const Icon = item.icon;
  return (
    <Link
      to={item.route}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Icon size={16} className="text-sda-blue dark:text-sda-gold shrink-0" />
      {t(item.labelKey)}
    </Link>
  );
}
