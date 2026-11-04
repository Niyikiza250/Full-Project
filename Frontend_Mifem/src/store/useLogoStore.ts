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
      merge: (persisted, current) => {
        const saved = persisted as Partial<LogoState> | undefined;
        const logo = saved?.logoDataUrl;
        return {
          ...current,
          ...saved,
          // Custom logos are uploaded as data URLs. Drop any old hardcoded
          // asset path that may have been persisted by previous versions.
          logoDataUrl: logo?.startsWith('data:') ? logo : null,
        };
      },
    }
  )
);
