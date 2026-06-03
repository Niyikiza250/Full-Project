import { Event, EventCategory, EventStatus } from '@/types/event';

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  WORSHIP: 'Worship',
  CONFERENCE: 'Field',
  COMMUNITY: 'Community',
  YOUTH: 'Youth',
  TRAINING: 'Training',
  OTHER: 'Other',
};

export const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const CATEGORY_COLORS: Record<EventCategory, string> = {
  WORSHIP: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  CONFERENCE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  COMMUNITY: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  YOUTH: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  TRAINING: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

export const STATUS_COLORS: Record<EventStatus, string> = {
  DRAFT: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  UPCOMING: 'bg-sda-gold text-sda-blue',
  ONGOING: 'bg-sda-blue text-white',
  COMPLETED: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  CANCELLED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export function formatEventDate(start: string, end?: string): string {
  const startDate = new Date(start);
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  if (!end) return startDate.toLocaleDateString(undefined, opts);

  const endDate = new Date(end);
  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (sameDay) {
    return `${startDate.toLocaleDateString(undefined, opts)} · ${startDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} – ${endDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `${startDate.toLocaleDateString(undefined, opts)} – ${endDate.toLocaleDateString(undefined, opts)}`;
}

export function formatTime(isoOrTime: string): string {
  if (isoOrTime.includes('T')) {
    return new Date(isoOrTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  return isoOrTime;
}

export function getAttendancePercent(event: Event): number {
  if (!event.maxAttendees) return 0;
  return Math.min(100, Math.round((event.currentAttendees / event.maxAttendees) * 100));
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getEventsForDate(events: Event[], date: Date): Event[] {
  return events.filter((e) => {
    const start = new Date(e.startDate);
    const end = new Date(e.endDate);
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const en = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    return d >= s && d <= en;
  });
}

export function computeEventStats(events: Event[]) {
  return {
    total: events.length,
    upcoming: events.filter((e) => e.status === 'UPCOMING').length,
    ongoing: events.filter((e) => e.status === 'ONGOING').length,
    completed: events.filter((e) => e.status === 'COMPLETED').length,
    totalAttendees: events.reduce((sum, e) => sum + e.currentAttendees, 0),
  };
}
