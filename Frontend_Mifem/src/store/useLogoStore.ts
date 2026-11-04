import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LogoState {
  logoDataUrl: string | null;
  setLogo: (dataUrl: string) => void;
  removeLogo: () => void;
}

export const useLogoStore = create<LogoState>()(
  persist(
    (set) => ({
      logoDataUrl: null,
      setLogo: (dataUrl) => set({ logoDataUrl: dataUrl }),
      removeLogo: () => set({ logoDataUrl: null }),
    }),
    {
      name: 'mifem-logo-storage',
    }
  )
);
