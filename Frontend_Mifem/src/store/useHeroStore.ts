import { create } from 'zustand';
import type { HeroSlide } from '@/components/home/heroData';
import { HERO_SLIDES } from '@/components/home/heroData';
import {
  fetchHeroSlides,
  saveHeroSlides,
  uploadHeroImage,
} from '@/api/heroSlides';
import type { HeroSlideDTO } from '@/api/heroSlides';

let fetching = false;

interface HeroState {
  slides: HeroSlide[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  initialized: boolean;

  fetchSlides: () => Promise<void>;
  saveToApi: () => Promise<boolean>;
}

function toDTO(s: HeroSlide): HeroSlideDTO {
  return {
    id: s.id,
    title: s.title,
    description: s.description,
    bgColor: s.bgColor,
    overlayFrom: s.overlayFrom,
    overlayTo: s.overlayTo,
    bgImage: s.bgImage,
    primaryCta: s.primaryCta,
    active: s.active,
    sortOrder: s.sortOrder,
  };
}

export const useHeroStore = create<HeroState>()((set, get) => ({
  slides: [...HERO_SLIDES],
  loading: false,
  saving: false,
  error: null,
  initialized: false,

  fetchSlides: async () => {
    if (fetching) return;
    fetching = true;
    set({ loading: true, error: null });
    try {
      const dtos = await fetchHeroSlides();
      const slides: HeroSlide[] = dtos.map((d) => ({
        ...d,
        bgColor: d.bgColor || 'bg-slate-900',
        overlayFrom: d.overlayFrom || 'from-slate-900/30',
        overlayTo: d.overlayTo || 'to-transparent',
      }));
      fetching = false;
      if (slides.length > 0) {
        set({ slides, loading: false, initialized: true });
      } else {
        set({ slides: [...HERO_SLIDES], loading: false, initialized: true });
      }
    } catch {
      fetching = false;
      set({
        loading: false,
        initialized: true,
        slides: get().slides.length > 0 ? get().slides : [...HERO_SLIDES],
      });
    }
  },

  saveToApi: async () => {
    set({ saving: true, error: null });
    try {
      const current = get().slides;
      const dtos: HeroSlideDTO[] = [];

      for (let i = 0; i < current.length; i++) {
        const slide = current[i];
        let bgImage = slide.bgImage;
        if (bgImage && bgImage.startsWith('data:')) {
          const uploaded = await uploadHeroImage(slide.id, bgImage);
          if (!uploaded) throw new Error('Image upload failed: server returned an empty path');
          bgImage = uploaded;
        }
        dtos.push({ ...toDTO(slide), bgImage, sortOrder: i });
      }

      await saveHeroSlides(dtos);
      set({ slides: dtos as HeroSlide[], saving: false });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save hero settings';
      set({ saving: false, error: message });
      return false;
    }
  },
}));
