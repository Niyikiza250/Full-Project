import type { AchievementItem } from '@/types/achievement';

const ACCHIEVEMENT_API = '/api/acchievement';

export async function saveAchievementData(item: AchievementItem): Promise<void> {
  await fetch(`${ACCHIEVEMENT_API}/data/${item.id}.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item, null, 2),
  });
}

export async function saveAchievementImage(itemId: string, dataUrl: string): Promise<string> {
  const res = await fetch(`${ACCHIEVEMENT_API}/images/${itemId}.png`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl }),
  });
  const { path } = await res.json();
  return path;
}

export async function deleteAchievementData(id: string): Promise<void> {
  await fetch(`${ACCHIEVEMENT_API}/data/${id}.json`, { method: 'DELETE' });
}

export async function listAchievements(): Promise<AchievementItem[]> {
  const res = await fetch(`${ACCHIEVEMENT_API}/data`);
  if (!res.ok) return [];
  return res.json();
}
