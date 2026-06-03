import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FontSizeState {
  fontSize: number;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

export const useFontSizeStore = create<FontSizeState>()(
  persist(
    (set) => ({
      fontSize: 16,
      setFontSize: (fontSize) => set({ fontSize }),
      increaseFontSize: () =>
        set((state) => ({ fontSize: Math.min(24, state.fontSize + 2) })),
      decreaseFontSize: () =>
        set((state) => ({ fontSize: Math.max(12, state.fontSize - 2) })),
    }),
    {
      name: 'font-size-storage',
    }
  )
);
