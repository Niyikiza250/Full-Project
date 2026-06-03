import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { localizeAchievement } from '@/lib/achievementLocalization';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';
import type { AchievementKind } from '@/types/achievement';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function useAchievements(kind?: AchievementKind | '') {
  const { t, i18n } = useTranslation();
  const items = useAchievementAdminStore((s) => s.items);
  const revision = useAchievementAdminStore((s) => s.revision);
  return useQuery({
    queryKey: ['achievements', kind || 'all', revision, i18n.language],
    queryFn: async () => {
      await delay(350);
      let list = items.filter((a) => a.status === 'APPROVED');
      if (kind) list = list.filter((a) => a.kind === kind);
      return list
        .map((item) => localizeAchievement(item, t))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    },
  });
}

export function useAchievementsAll(kind?: AchievementKind | '') {
  const { t, i18n } = useTranslation();
  const items = useAchievementAdminStore((s) => s.items);
  const revision = useAchievementAdminStore((s) => s.revision);
  return useQuery({
    queryKey: ['achievements-all', kind || 'all', revision, i18n.language],
    queryFn: async () => {
      await delay(200);
      let list = [...items];
      if (kind) list = list.filter((a) => a.kind === kind);
      return list
        .map((item) => localizeAchievement(item, t))
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    },
  });
}
