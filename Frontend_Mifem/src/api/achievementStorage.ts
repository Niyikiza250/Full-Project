import apiClient from './client';
import type { AchievementItem } from '@/types/achievement';

export async function saveAchievementData(item: AchievementItem): Promise<void> {
  await apiClient.put(`/achievement/data/${item.id}.json`, item);
}

export async function saveAchievementImage(itemId: string, dataUrl: string): Promise<string> {
  const { data } = await apiClient.put<{ data: { path: string } }>(
    `/achievement/images/${itemId}.png`,
    { dataUrl },
  );
  if (!data.data?.path) throw new Error('Failed to upload achievement image');
  return data.data.path;
}

export async function deleteAchievementData(id: string): Promise<void> {
  await apiClient.delete(`/achievement/data/${id}.json`);
}

export async function listAchievements(): Promise<AchievementItem[]> {
  const { data } = await apiClient.get<{ data: AchievementItem[] }>('/achievement/data');
  return data.data || [];
}
