import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAchievements } from '@/hooks/useAchievements';
import { Header } from '@/components/ui/Header';
import { MifemLogo } from '@/components/ui/MifemLogo';
import { cn } from '@/lib/utils';
import { BookOpen, ImageIcon, Landmark, Heart, Newspaper } from 'lucide-react';
import type { AchievementKind } from '@/types/achievement';

const kindIcon: Record<AchievementKind, React.ReactNode> = {
  STORY: <BookOpen size={18} aria-hidden />,
  GALLERY: <ImageIcon size={18} aria-hidden />,
  MILESTONE: <Landmark size={18} aria-hidden />,
  TESTIMONY: <Heart size={18} aria-hidden />,
  NEWS: <Newspaper size={18} aria-hidden />,
};

const kindColor: Record<AchievementKind, string> = {
  STORY: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  GALLERY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  MILESTONE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  TESTIMONY: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  NEWS: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
};

const kindLabelKey: Record<AchievementKind, string> = {
  STORY: 'achievements.story',
  GALLERY: 'achievements.gallery',
  MILESTONE: 'achievements.milestone',
  TESTIMONY: 'achievements.testimony',
  NEWS: 'achievements.news',
};

const Home: React.FC = () => {
  const { t } = useTranslation();
  const [kind, setKind] = useState<AchievementKind | ''>('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { data: items = [], isLoading } = useAchievements(kind);

  const kinds: (AchievementKind | '')[] = ['', 'MILESTONE', 'GALLERY', 'TESTIMONY', 'NEWS', 'STORY'];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <Header />

      <main className="mx-auto max-w-6xl px-4 pb-12 pt-24 sm:pb-20 sm:pt-28">
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-4">
              {t('achievements.title')}
            </h1>
            <p className="text-base sm:text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium px-2">
              {t('achievements.subtitle')}
            </p>
          </motion.div>
        </div>

        {/* Filter tabs - responsive */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-10 sm:mb-16">
          {kinds.map((k) => (
            <button
              key={k || 'all'}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-2xl px-5 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-sm md:text-base font-black transition-all shadow-sm',
                kind === k
                  ? 'bg-sda-blue text-white shadow-lg shadow-sda-blue/25 scale-105'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-sda-blue hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-800 dark:hover:ring-sda-gold'
              )}
            >
              {k ? t(kindLabelKey[k]) : t('common.all')}
            </button>
          ))}
        </div>

        {/* Achievement cards - increased font sizes */}
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 sm:h-96 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 sm:py-24 text-slate-500 dark:text-slate-400">
            <p className="text-xl sm:text-2xl font-bold">{t('achievements.noItems')}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-10 md:grid-cols-2">
            {items.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="relative h-48 sm:h-64 overflow-hidden">
                  {item.coverUrl ? (
                    <img src={item.coverUrl} alt="" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-sda-blue/20 to-sda-gold/20 flex items-center justify-center">
                      <div className="p-4 rounded-full bg-white/60 dark:bg-slate-800/60">
                        {kindIcon[item.kind]}
                      </div>
                    </div>
                  )}
                  <div className={cn(
                    'absolute left-3 sm:left-4 top-3 sm:top-4 inline-flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase backdrop-blur-md shadow-lg',
                    kindColor[item.kind]
                  )}>
                    {kindIcon[item.kind]}
                    {t(kindLabelKey[item.kind])}
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight group-hover:text-sda-blue dark:group-hover:text-sda-gold transition-colors">{item.title}</h3>
                  <p className="mt-2 text-xs sm:text-sm font-bold text-slate-400">{item.author}</p>
                  <p className={cn(
                    'mt-3 sm:mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium',
                    expanded.has(item.id) ? '' : 'line-clamp-2'
                  )}>
                    {item.summary}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleExpand(item.id)}
                    className="mt-3 px-3 py-2 text-xs sm:text-sm font-black text-sda-blue dark:text-sda-gold-light hover:underline"
                  >
                    {expanded.has(item.id) ? t('achievements.showLess') : t('achievements.readMore')}
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 sm:py-12 mt-8 sm:mt-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <MifemLogo size="md" className="justify-center mb-6" />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {t('home.footer', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
