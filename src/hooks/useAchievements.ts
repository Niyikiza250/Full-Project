import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { localizeAchievement } from '@/lib/achievementLocalization';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';
import type { AchievementKind } from '@/types/achievement';

export function useAchievements(kind?: AchievementKind | 'ALL') {
  const { t } = useTranslation();
  const items = useAchievementAdminStore((s) => s.items);
  return useMemo(() => {
    let list = items.filter((a) => a.status === 'APPROVED');
    if (kind && kind !== 'ALL') list = list.filter((a) => a.kind === kind);
    return list
      .map((item) => localizeAchievement(item, t))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [items, kind, t]);
}

export function useAchievementsAll(kind?: AchievementKind | 'ALL') {
  const { t } = useTranslation();
  const items = useAchievementAdminStore((s) => s.items);
  return useMemo(() => {
    let list = [...items];
    if (kind && kind !== 'ALL') list = list.filter((a) => a.kind === kind);
    return list
      .map((item) => localizeAchievement(item, t))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }, [items, kind, t]);
}
