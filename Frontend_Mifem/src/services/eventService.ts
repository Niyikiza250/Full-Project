import apiClient from '@/api/client';
import { Event, EventFilters, AttendanceRecord } from '@/types/event';

interface BackendEvent {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  organizer: string;
  maxAttendees?: number;
  currentAttendees: number;
  imageUrl?: string;
  created_at?: string;
  updated_at?: string;
  timeline?: { id: string; time: string; activity: string; description?: string; sortOrder?: number }[];
  registrations?: { id: string; memberId: string; memberName: string; status: string; registeredAt?: string }[];
}

function mapEvent(raw: BackendEvent): Event {
  const timeline = (raw.timeline || []).map((t) => ({
    id: t.id,
    time: t.time,
    activity: t.activity,
    description: t.description,
  }));

  const attendance: AttendanceRecord[] = (raw.registrations || []).map((r) => ({
    memberId: r.memberId || '',
    memberName: r.memberName,
    status: r.status === 'ATTENDED' ? 'PRESENT' as const
      : r.status === 'ABSENT' ? 'ABSENT' as const
      : 'PRESENT' as const,
    registeredAt: r.registeredAt,
  }));

  return {
    id: raw.id,
    title: raw.title,
    description: raw.description || '',
    category: raw.category as Event['category'],
    status: raw.status as Event['status'],
    startDate: raw.startDate,
    endDate: raw.endDate,
    location: raw.location || '',
    organizer: raw.organizer || '',
    maxAttendees: raw.maxAttendees ?? undefined,
    currentAttendees: raw.currentAttendees ?? 0,
    imageUrl: raw.imageUrl || '',
    timeline,
    attendance,
  };
}

export const eventService = {
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    const params: Record<string, string> = {};
    if (filters?.search) params.search = filters.search;
    if (filters?.category) params.category = filters.category;
    if (filters?.status) params.status = filters.status;
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    params.limit = '200';

    const { data } = await apiClient.get<{ success: boolean; data: BackendEvent[] }>('/events', { params });
    return (data.data || []).map(mapEvent);
  },

  async getEventById(id: string): Promise<Event | undefined> {
    try {
      const { data } = await apiClient.get<{ success: boolean; data: BackendEvent }>(`/events/${id}`);
      return data.data ? mapEvent(data.data) : undefined;
    } catch {
      return undefined;
    }
  },

  async createEvent(event: Omit<Event, 'id' | 'currentAttendees' | 'attendance'>): Promise<Event> {
    const payload = {
      title: event.title,
      description: event.description,
      category: event.category,
      status: event.status,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      organizer: event.organizer,
      maxAttendees: event.maxAttendees,
      imageUrl: event.imageUrl,
      churchId: event.churchId,
      fieldId: event.fieldId,
    };
    const { data } = await apiClient.post<{ success: boolean; data: BackendEvent }>('/events', payload);
    return mapEvent(data.data);
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    const payload: Record<string, unknown> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.status !== undefined) payload.status = updates.status;
    if (updates.startDate !== undefined) payload.startDate = updates.startDate;
    if (updates.endDate !== undefined) payload.endDate = updates.endDate;
    if (updates.location !== undefined) payload.location = updates.location;
    if (updates.organizer !== undefined) payload.organizer = updates.organizer;
    if (updates.maxAttendees !== undefined) payload.maxAttendees = updates.maxAttendees;
    if (updates.imageUrl !== undefined) payload.imageUrl = updates.imageUrl;

    const { data } = await apiClient.put<{ success: boolean; data: BackendEvent }>(`/events/${id}`, payload);
    return mapEvent(data.data);
  },

  async registerAttendance(eventId: string, memberId: string, memberName: string): Promise<Event> {
    await apiClient.post(
      `/events/${eventId}/attendance`,
      { memberId, memberName, status: 'ATTENDED' },
    );
    return this.getEventById(eventId) as Promise<Event>;
  },
};
