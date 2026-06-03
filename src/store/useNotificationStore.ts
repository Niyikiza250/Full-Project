import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ToastType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'ANNOUNCEMENT';

export interface ToastItem {
  id: string;
  title: string;
  body: string;
  type: ToastType;
  duration?: number;
  data?: any; // any extra payload (e.g., full announcement object)
  onClick?: () => void;
}

interface NotificationState {
  toasts: ToastItem[];
  soundEnabled: boolean;
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  toggleSound: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      toasts: [],
      soundEnabled: true,
      addToast: (toast) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const duration = toast.duration ?? 5000;
        
        const newToast: ToastItem = {
          ...toast,
          id,
          duration,
        };

        set((state) => ({
          toasts: [newToast, ...state.toasts],
        }));

        // Set auto-dismiss timer
        if (duration > 0) {
          setTimeout(() => {
            get().dismissToast(id);
          }, duration);
        }

        return id;
      },
      dismissToast: (id) => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      },
      clearAllToasts: () => {
        set({ toasts: [] });
      },
      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }));
      },
    }),
    {
      name: 'notification-settings-storage',
      partialize: (state) => ({ soundEnabled: state.soundEnabled }),
    }
  )
);
