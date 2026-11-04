import React from 'react';
import { ROUTES, UserRole } from './routes';
import {
  LayoutDashboard,
  Users,
  Calendar,
  UserCheck,
  Map,
  Activity,
  FileText,
  Megaphone,
  ShieldCheck,
  Building2,
  HandHeart,
  GraduationCap,
  FolderOpen,
  MessagesSquare,
  ClipboardList,
  Medal,
  Clock,
  Globe,
  Home,
  Newspaper,
} from 'lucide-react';

export interface NavItem {
  to?: string;
  icon: React.ReactNode;
  labelKey: string;
  roles: UserRole[] | 'ALL';
  subItems?: Omit<NavItem, 'icon' | 'roles' | 'subItems'>[];
}

const SUPER_ADMIN_ROLES: UserRole[] = ['SUPER_ADMIN'];

export const NAVIGATION_CONFIG: NavItem[] = [
  // Dashboard - ALL roles
  {
    to: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={20} />,
    labelKey: 'Dashboard',
    roles: 'ALL',
  },

  // Landing Page - admin roles
  {
    to: ROUTES.LANDING_PAGE,
    icon: <Globe size={20} />,
    labelKey: 'Landing Page',
    roles: ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR'],
  },

  // ===== SUPER ADMIN & FIELD ADMIN =====
  {
    to: ROUTES.ADMIN_USERS_SELECT,
    icon: <Users size={20} />,
    labelKey: 'Users',
    roles: SUPER_ADMIN_ROLES,
  },
  {
    to: ROUTES.ADMIN_USERS,
    icon: <Users size={20} />,
    labelKey: 'Users',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  {
    to: ROUTES.ADMIN_FIELDS,
    icon: <Building2 size={20} />,
    labelKey: 'Fields',
    roles: SUPER_ADMIN_ROLES,
  },
  {
    to: ROUTES.ROLES_PERMISSIONS,
    icon: <ShieldCheck size={20} />,
    labelKey: 'Roles & Permissions',
    roles: SUPER_ADMIN_ROLES,
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports & Analytics',
    roles: SUPER_ADMIN_ROLES,
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: SUPER_ADMIN_ROLES,
  },
  // ===== FIELD ADMINISTRATOR =====
  {
    to: ROUTES.MEMBERS,
    icon: <Users size={20} />,
    labelKey: 'Members',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports & Analytics',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  {
    to: ROUTES.TASKS,
    icon: <ClipboardList size={20} />,
    labelKey: 'Tasks',
    roles: ['FIELD_ADMINISTRATOR'],
  },
  // ===== UNION LEADER =====
  {
    to: ROUTES.FIELDS,
    icon: <Map size={20} />,
    labelKey: 'Fields',
    roles: ['UNION_LEADER'],
  },
  {
    to: ROUTES.MINISTRY_ACTIVITIES,
    icon: <Activity size={20} />,
    labelKey: 'Ministry Activities',
    roles: ['UNION_LEADER'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports & Analytics',
    roles: ['UNION_LEADER'],
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['UNION_LEADER'],
  },
  // ===== CONFERENCE LEADER =====
  {
    to: ROUTES.DISTRICTS,
    icon: <Map size={20} />,
    labelKey: 'Districts',
    roles: ['FIELD_LEADER'],
  },
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['FIELD_LEADER'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Field Reports',
    roles: ['FIELD_LEADER'],
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['FIELD_LEADER'],
  },
  // ===== DISTRICT LEADER =====
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['DISTRICT_LEADER'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports',
    roles: ['DISTRICT_LEADER'],
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['DISTRICT_LEADER'],
  },
  // ===== CHURCH LEADER =====
  {
    to: ROUTES.MEMBERS,
    icon: <Users size={20} />,
    labelKey: 'Members',
    roles: ['CHURCH_LEADER'],
  },
  {
    to: ROUTES.ATTENDANCE,
    icon: <UserCheck size={20} />,
    labelKey: 'Attendance',
    roles: ['CHURCH_LEADER'],
  },
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['CHURCH_LEADER'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports',
    roles: ['CHURCH_LEADER'],
  },

  // ===== MINISTRY LEADER =====
  {
    to: ROUTES.MEMBERS,
    icon: <Users size={20} />,
    labelKey: 'Members',
    roles: ['MINISTRY_LEADER'],
  },
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['MINISTRY_LEADER'],
  },
  {
    to: ROUTES.ATTENDANCE,
    icon: <UserCheck size={20} />,
    labelKey: 'Attendance',
    roles: ['MINISTRY_LEADER'],
  },
  {
    to: ROUTES.REPORTS,
    icon: <FileText size={20} />,
    labelKey: 'Reports',
    roles: ['MINISTRY_LEADER'],
  },
  // ===== MEMBER =====
  {
    to: ROUTES.ANNOUNCEMENTS,
    icon: <Megaphone size={20} />,
    labelKey: 'Announcements',
    roles: ['MEMBER'],
  },
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['MEMBER'],
  },
  // ===== VOLUNTEER =====
  {
    to: ROUTES.EVENTS,
    icon: <Calendar size={20} />,
    labelKey: 'Events',
    roles: ['VOLUNTEER'],
  },
  // ===== NEW MODULES =====
  {
    to: ROUTES.PRAYER_COUNSELING,
    icon: <HandHeart size={20} />,
    labelKey: 'Prayer & Counseling',
    roles: ['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'],
  },
  {
    to: ROUTES.TRAINING,
    icon: <GraduationCap size={20} />,
    labelKey: 'Training',
    roles: ['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'],
  },
  {
    to: ROUTES.DOCUMENTS,
    icon: <FolderOpen size={20} />,
    labelKey: 'Documents',
    roles: ['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'CHURCH_LEADER', 'MINISTRY_LEADER'],
  },
  {
    to: ROUTES.FORUMS,
    icon: <MessagesSquare size={20} />,
    labelKey: 'Forums',
    roles: 'ALL',
  },
  {
    to: ROUTES.VOLUNTEER_HOURS,
    icon: <Clock size={20} />,
    labelKey: 'Service Hours',
    roles: ['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'MINISTRY_LEADER', 'VOLUNTEER'],
  },
  {
    to: ROUTES.VOLUNTEER_RECOGNITION,
    icon: <Medal size={20} />,
    labelKey: 'Recognition',
    roles: ['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'MINISTRY_LEADER', 'VOLUNTEER'],
  },
];
