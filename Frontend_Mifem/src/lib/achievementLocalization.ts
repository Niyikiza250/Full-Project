import type { TFunction } from 'i18next';
import type { AchievementItem } from '@/types/achievement';

const achievementTranslationKeyMap: Partial<Record<string, string>> = {
  ach1: 'achievements.items.ach1',
  ach2: 'achievements.items.ach2',
  ach3: 'achievements.items.ach3',
  ach4: 'achievements.items.ach4',
  ach5: 'achievements.items.ach5',
};

export function localizeAchievement(item: AchievementItem, t: TFunction): AchievementItem {
  const baseKey = achievementTranslationKeyMap[item.id];
  if (!baseKey) return item;

  return {
    ...item,
    title: t(`${baseKey}.title`),
    summary: t(`${baseKey}.summary`),
    author: t(`${baseKey}.author`),
    submittedBy: item.submittedBy ? t(`${baseKey}.submittedBy`) : item.submittedBy,
    tags: t(`${baseKey}.tagsCsv`).split(',').map((tag) => tag.trim()).filter(Boolean),
  };
}
