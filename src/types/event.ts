import { UserRole } from '@/constants/routes';

export type EventStatus = 'DRAFT' | 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type EventCategory = 'WORSHIP' | 'FIELD' | 'COMMUNITY' | 'YOUTH' | 'TRAINING' | 'OTHER';

export interface TimelineEntry {
  id: string;
  time: string;
  activity: string;
  description?: string;
}

export interface AttendanceRecord {
  memberId: string;
  memberName: string;
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  registeredAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  status: EventStatus;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  timeline: TimelineEntry[];
  attendance: AttendanceRecord[];
}

export interface EventFilters {
  search?: string;
  category?: EventCategory;
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
}
