import { UserRole } from '@/constants/routes';

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'TRANSFERRED' | 'DECEASED';

export type AgeGroup = 'YOUTH' | 'YOUNG_ADULT' | 'ADULT' | 'SENIOR';

export type MinistryRole =
  | 'CHOIR'
  | 'OUTREACH'
  | 'TEACHING'
  | 'HOSPITALITY'
  | 'DEACON'
  | 'ELDER'
  | 'SABBATH_SCHOOL_TEACHER'
  | 'PATHFINDER_LEADER'
  | 'ADVENTIST_YOUTH_LEADER'
  | 'COMMUNITY_SERVICES'
  | 'OTHER';

export const MINISTRY_ROLE_LABELS: Record<MinistryRole, string> = {
  CHOIR: 'Choir',
  OUTREACH: 'Outreach',
  TEACHING: 'Teaching',
  HOSPITALITY: 'Hospitality',
  DEACON: 'Deacon / Deaconess',
  ELDER: 'Elder',
  SABBATH_SCHOOL_TEACHER: 'Sabbath School Teacher',
  PATHFINDER_LEADER: 'Pathfinder Leader',
  ADVENTIST_YOUTH_LEADER: 'Adventist Youth Leader',
  COMMUNITY_SERVICES: 'Community Services',
  OTHER: 'Other',
};

export const AGE_GROUP_LABELS: Record<AgeGroup, string> = {
  YOUTH: 'Youth (13–25)',
  YOUNG_ADULT: 'Young Adult (26–35)',
  ADULT: 'Adult (36–60)',
  SENIOR: 'Senior (60+)',
};

export function calculateAgeGroup(dateOfBirth: string): AgeGroup | null {
  if (!dateOfBirth) return null;
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  if (age < 13) return null;
  if (age <= 25) return 'YOUTH';
  if (age <= 35) return 'YOUNG_ADULT';
  if (age <= 60) return 'ADULT';
  return 'SENIOR';
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface MemberActivity {
  id: string;
  type: 'BAPTISM' | 'TRANSFER' | 'ROLE_CHANGE' | 'OFFICE_APPOINTMENT' | 'NOTE';
  description: string;
  date: string;
  performedBy: string;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  role: UserRole;
  status: MemberStatus;
  churchName: string;
  zoneName: string;
  fieldName: string;
  unionName: string;
  sabbathClass?: string;
  baptismDate?: string;
  joinDate: string;
  address: string;
  village?: string;
  sector?: string;
  district?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth: string;
  ageGroup?: AgeGroup;
  ministryRoles?: MinistryRole[];
  emergencyContact?: EmergencyContact;
  imageUrl?: string;
  activities: MemberActivity[];
}

export interface MemberFilters {
  search?: string;
  role?: UserRole;
  status?: MemberStatus;
  field?: string;
  church?: string;
  sabbathClass?: string;
}

export interface MemberChangeRequest {
  id: string;
  memberId?: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  submittedBy: string;
  submittedByRole: UserRole;
  submittedByEmail: string;
  submittedAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  changes: Partial<Member>;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}
