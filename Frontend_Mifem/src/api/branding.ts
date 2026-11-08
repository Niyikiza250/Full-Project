import apiClient from './client';

export type BrandAsset = 'logo' | 'adventistLogo' | 'favicon';

export interface Branding {
  logo: string | null;
  adventistLogo: string | null;
  favicon: string | null;
}

export async function fetchBranding(): Promise<Branding> {
  const { data } = await apiClient.get<{ data: Branding }>('/branding');
  return {
    logo: data.data?.logo ?? null,
    adventistLogo: data.data?.adventistLogo ?? null,
    favicon: data.data?.favicon ?? null,
  };
}

export async function saveBrandAsset(asset: BrandAsset, value: string): Promise<void> {
  await apiClient.put(`/branding/${asset}`, { value });
}

export async function resetBrandAsset(asset: BrandAsset): Promise<void> {
  await apiClient.delete(`/branding/${asset}`);
}
