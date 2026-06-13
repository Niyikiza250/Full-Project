import type { AchievementItem } from '@/types/achievement';

const ACHIEVEMENT_API = '/api/achievement';

export async function saveAchievementData(item: AchievementItem): Promise<void> {
  await fetch(`${ACHIEVEMENT_API}/data/${item.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item, null, 2),
  });
}

export async function saveAchievementImage(itemId: string, dataUrl: string): Promise<string> {
  const res = await fetch(`${ACHIEVEMENT_API}/images/${itemId}.png`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  });
  const resData = await res.json();
  if (!resData.path) throw new Error('Failed to upload achievement image');
  return resData.path;
}

export async function deleteAchievementData(id: string): Promise<void> {
  await fetch(`${ACHIEVEMENT_API}/data/${id}.json`, { method: 'DELETE' });
}

export async function listAchievements(): Promise<AchievementItem[]> {
  const res = await fetch(`${ACHIEVEMENT_API}/data`);
  if (!res.ok) return [];
  return res.json();
}
