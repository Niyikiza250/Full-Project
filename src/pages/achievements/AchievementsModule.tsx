import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import { useAchievements } from '@/hooks/useAchievements';
import type { AchievementKind } from '@/types/achievement';
import { cn } from '@/lib/utils';
import { BookOpen, ImageIcon, Landmark, Heart, Newspaper } from 'lucide-react';

const kindIcon: Record<AchievementKind, React.ReactNode> = {
  STORY: <BookOpen size={16} aria-hidden />,
  GALLERY: <ImageIcon size={16} aria-hidden />,
  MILESTONE: <Landmark size={16} aria-hidden />,
  TESTIMONY: <Heart size={16} aria-hidden />,
  NEWS: <Newspaper size={16} aria-hidden />,
};

const kindLabelKey: Record<AchievementKind, string> = {
  STORY: 'achievements.story',
  GALLERY: 'achievements.gallery',
  MILESTONE: 'achievements.milestone',
  TESTIMONY: 'achievements.testimony',
  NEWS: 'achievements.news',
};

const AchievementsModule: React.FC = () => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<AchievementKind | ''>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data: items = [], isLoading } = useAchievements(kind);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const kinds: (AchievementKind | '')[] = ['', 'MILESTONE', 'GALLERY', 'TESTIMONY', 'NEWS', 'STORY'];

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <PageHeader title={t('achievements.title')} subtitle={t('achievements.subtitle')} />

      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k || 'all'}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              'rounded-full px-4 py-2.5 text-xs font-bold transition-all',
              kind === k ? 'bg-sda-blue text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
            )}
          >
            {k ? t(kindLabelKey[k]) : t('common.all')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : (
        <>
          {items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center text-sm font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              {t('achievements.noItems')}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {items.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="relative h-48 overflow-hidden">
                    {item.coverUrl ? (
                      <img src={item.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-sda-blue/20 to-sda-gold/20">
                        <div className="rounded-full bg-white/60 p-3 dark:bg-slate-800/60">
                          {kindIcon[item.kind]}
                        </div>
                      </div>
                    )}
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
                      {kindIcon[item.kind]}
                      {t(kindLabelKey[item.kind])}
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h2>
                    <p className="mt-1 text-[11px] font-semibold text-slate-400">{item.author}</p>
                    <p className={cn(
                      'mt-2 text-sm text-slate-600 dark:text-slate-300',
                      expanded.has(item.id) ? '' : 'line-clamp-2'
                    )}>
                      {item.summary}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleExpand(item.id)}
                      className="mt-2 px-3 py-2 text-xs font-bold text-sda-blue hover:underline dark:text-sda-gold"
                    >
                      {expanded.has(item.id) ? t('achievements.showLess') : t('achievements.readMore')}
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AchievementsModule;
