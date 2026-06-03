import type { UserRole } from '@/constants/routes';

export type AllowedTargets = {
  roles: UserRole[];
  label: string;
}[];

export function getTargetRolesForSender(senderRole: UserRole): AllowedTargets {
  switch (senderRole) {
    case 'SUPER_ADMIN':
      return [
        { roles: ['UNION_LEADER'], label: 'Union Leaders' },
        { roles: ['FIELD_LEADER'], label: 'Conference Leaders' },
        { roles: ['DISTRICT_LEADER'], label: 'District Leaders' },
        { roles: ['CHURCH_LEADER'], label: 'Church Leaders' },
        { roles: ['MINISTRY_LEADER'], label: 'Ministry Leaders' },
        { roles: ['MEMBER'], label: 'Members' },
        { roles: ['VOLUNTEER'], label: 'Volunteers' },
        { roles: ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'], label: 'Entire System' },
      ];
    case 'UNION_LEADER':
      return [
        { roles: ['FIELD_LEADER'], label: 'Conference Leaders' },
      ];
    case 'FIELD_LEADER':
      return [
        { roles: ['DISTRICT_LEADER'], label: 'District Leaders' },
      ];
    case 'DISTRICT_LEADER':
      return [
        { roles: ['CHURCH_LEADER'], label: 'Church Leaders' },
      ];
    case 'CHURCH_LEADER':
      return [
        { roles: ['MINISTRY_LEADER'], label: 'Ministry Leaders' },
        { roles: ['MEMBER'], label: 'Members' },
      ];
    case 'MINISTRY_LEADER':
      return [
        { roles: ['MEMBER'], label: 'Members' },
        { roles: ['VOLUNTEER'], label: 'Volunteers' },
      ];
    default:
      return [];
  }
}

export function canSenderTarget(senderRole: UserRole, targetRole: UserRole): boolean {
  const targets = getTargetRolesForSender(senderRole);
  return targets.some((t) => t.roles.includes(targetRole));
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  UNION_LEADER: 'Union Leader',
  FIELD_LEADER: 'Conference Leader',
  DISTRICT_LEADER: 'District Leader',
  CHURCH_LEADER: 'Church Leader',
  MINISTRY_LEADER: 'Ministry Leader',
  MEMBER: 'Member',
  VOLUNTEER: 'Volunteer',
};
