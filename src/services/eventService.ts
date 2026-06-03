import { Event, EventFilters } from '@/types/event';
import { MOCK_EVENTS } from '@/utils/mockData';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const eventService = {
  async getEvents(filters?: EventFilters): Promise<Event[]> {
    await delay(500);
    let events = [...MOCK_EVENTS];

    if (filters) {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        events = events.filter(
          (e) =>
            e.title.toLowerCase().includes(search) ||
            e.description.toLowerCase().includes(search) ||
            e.location.toLowerCase().includes(search)
        );
      }
      if (filters.category) {
        events = events.filter((e) => e.category === filters.category);
      }
      if (filters.status) {
        events = events.filter((e) => e.status === filters.status);
      }
    }

    return events;
  },

  async getEventById(id: string): Promise<Event | undefined> {
    await delay(300);
    return MOCK_EVENTS.find((e) => e.id === id);
  },

  async createEvent(event: Omit<Event, 'id' | 'currentAttendees' | 'attendance'>): Promise<Event> {
    await delay(800);
    const newEvent: Event = {
      ...event,
      id: `e${MOCK_EVENTS.length + 1}`,
      currentAttendees: 0,
      attendance: [],
    };
    MOCK_EVENTS.push(newEvent);
    return newEvent;
  },

  async updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
    await delay(600);
    const index = MOCK_EVENTS.findIndex((e) => e.id === id);
    if (index === -1) throw new Error('Event not found');
    
    MOCK_EVENTS[index] = { ...MOCK_EVENTS[index], ...updates };
    return MOCK_EVENTS[index];
  },

  async registerAttendance(eventId: string, memberId: string, memberName: string): Promise<Event> {
    await delay(400);
    const event = MOCK_EVENTS.find((e) => e.id === eventId);
    if (!event) throw new Error('Event not found');

    const existing = event.attendance.find((a) => a.memberId === memberId);
    if (existing) {
      existing.status = 'PRESENT';
      existing.registeredAt = new Date().toISOString();
    } else {
      event.attendance.push({
        memberId,
        memberName,
        status: 'PRESENT',
        registeredAt: new Date().toISOString(),
      });
      event.currentAttendees += 1;
    }

    return { ...event };
  },
};
