import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FaviconState {
  faviconDataUrl: string | null;
  setFavicon: (dataUrl: string) => void;
  removeFavicon: () => void;
}

export const useFaviconStore = create<FaviconState>()(
  persist(
    (set) => ({
      faviconDataUrl: null,
      setFavicon: (dataUrl) => set({ faviconDataUrl: dataUrl }),
      removeFavicon: () => set({ faviconDataUrl: null }),
    }),
    {
      name: 'mifem-favicon-storage',
    }
  )
);
