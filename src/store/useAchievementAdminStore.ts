import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AchievementItem, AchievementStatus } from '@/types/achievement';
import { MOCK_ACHIEVEMENTS } from '@/data/enterpriseMocks';
import { saveAchievementData, deleteAchievementData, listAchievements } from '@/api/achievementStorage';

interface AchievementAdminState {
  items: AchievementItem[];
  revision: number;
  loadedFromStatic: boolean;
  loadMocks: () => void;
  loadFromStatic: () => Promise<void>;
  addItem: (item: Omit<AchievementItem, 'id' | 'publishedAt' | 'status'>) => Promise<void>;
  submitFromLeader: (item: Omit<AchievementItem, 'id' | 'publishedAt' | 'status' | 'submittedBy' | 'submittedByRole'> & { submittedBy: string; submittedByRole: string }) => Promise<void>;
  updateItem: (id: string, updates: Partial<AchievementItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  approveItem: (id: string) => Promise<void>;
  rejectItem: (id: string) => Promise<void>;
  getPendingItems: () => AchievementItem[];
  getApprovedItems: () => AchievementItem[];
}

export const useAchievementAdminStore = create<AchievementAdminState>()(
  persist(
    (set, get) => ({
      items: [...MOCK_ACHIEVEMENTS],
      revision: 0,
      loadedFromStatic: false,
      loadMocks: () => set({ items: [...MOCK_ACHIEVEMENTS], revision: 0 }),
      loadFromStatic: async () => {
        const staticItems = await listAchievements();
        if (staticItems.length > 0) {
          set({ items: staticItems, loadedFromStatic: true, revision: 0 });
        }
      },
      addItem: async (item) => {
        const newItem: AchievementItem = {
          ...item,
          id: `achievement_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          publishedAt: new Date().toISOString().split('T')[0],
          status: 'APPROVED',
        };
        set((state) => ({ items: [newItem, ...state.items], revision: state.revision + 1 }));
        await saveAchievementData(newItem);
      },
      submitFromLeader: async (item) => {
        const newItem: AchievementItem = {
          ...item,
          id: `achievement_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          publishedAt: new Date().toISOString().split('T')[0],
          status: 'PENDING',
        };
        set((state) => ({ items: [newItem, ...state.items], revision: state.revision + 1 }));
        await saveAchievementData(newItem);
      },
      updateItem: async (id, updates) => {
        const prev = get().items.find((i) => i.id === id);
        if (!prev) return;
        const merged = { ...prev, ...updates };
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? merged : i)),
          revision: state.revision + 1,
        }));
        await saveAchievementData(merged);
      },
      deleteItem: async (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
          revision: state.revision + 1,
        }));
        await deleteAchievementData(id);
      },
      approveItem: async (id) => {
        const prev = get().items.find((i) => i.id === id);
        if (!prev) return;
        const merged = { ...prev, status: 'APPROVED' as AchievementStatus };
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? merged : i)),
          revision: state.revision + 1,
        }));
        await saveAchievementData(merged);
      },
      rejectItem: async (id) => {
        const prev = get().items.find((i) => i.id === id);
        if (!prev) return;
        const merged = { ...prev, status: 'REJECTED' as AchievementStatus };
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? merged : i)),
          revision: state.revision + 1,
        }));
        await saveAchievementData(merged);
      },
      getPendingItems: () => get().items.filter((i) => i.status === 'PENDING'),
      getApprovedItems: () => get().items.filter((i) => i.status === 'APPROVED'),
    }),
    {
      name: 'mifem-achievement-admin',
      merge: (persisted: unknown, current: AchievementAdminState) => {
        const p = persisted as { items?: AchievementItem[] } | undefined;
        const items = (p?.items || current.items).map((item) => ({
          ...item,
          status: (item as AchievementItem).status || ('APPROVED' as AchievementStatus),
        }));
        return { ...current, items };
      },
    }
  )
);
