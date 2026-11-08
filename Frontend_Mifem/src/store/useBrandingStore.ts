import { create } from 'zustand';
import {
  fetchBranding,
  saveBrandAsset,
  resetBrandAsset,
  type BrandAsset,
} from '@/api/branding';

interface BrandingState {
  logoDataUrl: string | null;
  adventistLogoDataUrl: string | null;
  faviconDataUrl: string | null;
  loaded: boolean;
  loading: boolean;
  load: () => Promise<void>;
  saveAsset: (asset: BrandAsset, dataUrl: string) => Promise<void>;
  removeAsset: (asset: BrandAsset) => Promise<void>;
}

const stateKey: Record<BrandAsset, 'logoDataUrl' | 'adventistLogoDataUrl' | 'faviconDataUrl'> = {
  logo: 'logoDataUrl',
  adventistLogo: 'adventistLogoDataUrl',
  favicon: 'faviconDataUrl',
};

export const useBrandingStore = create<BrandingState>()((set, get) => ({
  logoDataUrl: null,
  adventistLogoDataUrl: null,
  faviconDataUrl: null,
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const branding = await fetchBranding();
      set({
        logoDataUrl: branding.logo,
        adventistLogoDataUrl: branding.adventistLogo,
        faviconDataUrl: branding.favicon,
        loaded: true,
        loading: false,
      });
    } catch (error) {
      console.error('Failed to load branding from the API', error);
      set({ loaded: true, loading: false });
    }
  },

  saveAsset: async (asset, dataUrl) => {
    const key = stateKey[asset];
    const previous = get()[key];
    set({ [key]: dataUrl } as Partial<BrandingState>);
    try {
      await saveBrandAsset(asset, dataUrl);
    } catch (err) {
      set({ [key]: previous } as Partial<BrandingState>);
      throw err;
    }
  },

  removeAsset: async (asset) => {
    const key = stateKey[asset];
    const previous = get()[key];
    set({ [key]: null } as Partial<BrandingState>);
    try {
      await resetBrandAsset(asset);
    } catch (err) {
      set({ [key]: previous } as Partial<BrandingState>);
      throw err;
    }
  },
}));
