import { UserRole } from '@/constants/routes';

export type AccountStatus = 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'LOCKED';

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  lastLogin?: string;
  mfaEnabled: boolean;
  permissions: string[];
  unionId?: string;
  fieldId?: string;
  districtId?: string;
  churchId?: string;
  ministryId?: string;
  volunteerId?: string;
  temporaryPasswordStatus?: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export interface AdminActivity {
  id: string;
  user: string;
  description: string;
  at: string;
}

export const PERMISSION_GROUPS: { id: string; labelKey: string; permissions: string[] }[] = [
  {
    id: 'core',
    labelKey: 'admin.permGroupCore',
    permissions: ['members.read', 'members.write', 'events.read', 'events.write'],
  },
  {
    id: 'attendance',
    labelKey: 'admin.permGroupAttendance',
    permissions: ['attendance.read', 'attendance.checkin', 'attendance.export'],
  },
  {
    id: 'comms',
    labelKey: 'admin.permGroupComms',
    permissions: ['comms.announce', 'comms.message', 'comms.sms'],
  },
  {
    id: 'reports',
    labelKey: 'admin.permGroupReports',
    permissions: ['reports.view', 'reports.export'],
  },
  {
    id: 'admin',
    labelKey: 'admin.permGroupAdmin',
    permissions: ['users.manage', 'roles.assign', 'audit.read'],
  },
];
