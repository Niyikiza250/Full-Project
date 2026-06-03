import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NotificationReadState {
  readIds: string[];
  markRead: (id: string) => void;
  markAllRead: (ids: string[]) => void;
  isRead: (id: string) => boolean;
}

export const useNotificationReadStore = create<NotificationReadState>()(
  persist(
    (set, get) => ({
      readIds: [],
      markRead: (id) =>
        set((s) => ({
          readIds: s.readIds.includes(id) ? s.readIds : [...s.readIds, id],
        })),
      markAllRead: (ids) =>
        set((s) => ({
          readIds: Array.from(new Set([...s.readIds, ...ids])),
        })),
      isRead: (id) => get().readIds.includes(id),
    }),
    { name: 'mifem-notification-read' }
  )
);
