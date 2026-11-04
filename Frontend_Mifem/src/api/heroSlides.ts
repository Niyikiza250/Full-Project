import apiClient from './client';

export interface HeroSlideDTO {
  id: string;
  title: string;
  description: string;
  bgColor: string;
  overlayFrom: string;
  overlayTo: string;
  bgImage?: string;
  primaryCta: { label: string; href: string };
  active: boolean;
  sortOrder?: number;
}

export async function fetchHeroSlides(): Promise<HeroSlideDTO[]> {
  const { data } = await apiClient.get<{ data: HeroSlideDTO[] }>('/hero-slides');
  return data.data || [];
}

export async function saveHeroSlides(
  slides: HeroSlideDTO[],
): Promise<{ ok: boolean }> {
  const { data } = await apiClient.put<{ data: { ok: boolean } }>('/hero-slides', {
    slides,
  });
  return data.data || { ok: true };
}

export async function uploadHeroImage(
  slideId: string,
  dataUrl: string,
): Promise<string> {
  const { data } = await apiClient.put<{ data: { path: string } }>(
    `/hero-slides/${slideId}/image`,
    { dataUrl },
  );
  return data.data?.path || '';
}
