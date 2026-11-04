import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAchievements } from '@/hooks/useAchievements';
import { MifemLogo } from '@/components/ui/MifemLogo';
import HeroSection from '@/components/home/HeroSection';
import GlassCard from '@/components/home/GlassCard';
import MainHeader from '@/components/header/MainHeader';
import { cn } from '@/lib/utils';
import {
  BookOpen, ImageIcon, Landmark, Heart, Newspaper, ArrowUpRight,
} from 'lucide-react';
import type { AchievementKind } from '@/types/achievement';

const kindIcon: Record<AchievementKind, React.ReactNode> = {
  STORY: <BookOpen size={18} aria-hidden />,
  GALLERY: <ImageIcon size={18} aria-hidden />,
  MILESTONE: <Landmark size={18} aria-hidden />,
  TESTIMONY: <Heart size={18} aria-hidden />,
  NEWS: <Newspaper size={18} aria-hidden />,
};

const kindColor: Record<AchievementKind, string> = {
  STORY: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  GALLERY: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  MILESTONE: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  TESTIMONY: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  NEWS: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
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
  const items = useAchievements(kind || undefined);

  const kinds: (AchievementKind | '')[] = ['', 'MILESTONE', 'GALLERY', 'TESTIMONY', 'NEWS', 'STORY'];

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-200">
      <MainHeader />
      <div className="pt-[72px]">
        <HeroSection />

      {/* Achievements Section */}
      <section id="achievements" className="mx-auto max-w-6xl px-4 pb-12 sm:pb-20 pt-10 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-10"
        >
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
            {t('achievements.title')}
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-slate-500 dark:text-white/50 max-w-2xl mx-auto font-medium">
            {t('achievements.subtitle')}
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-12">
          {kinds.map((k) => (
            <button
              key={k || 'all'}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'rounded-2xl px-5 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-black transition-all',
                kind === k
                  ? 'bg-sda-gold text-sda-blue shadow-lg shadow-sda-gold/20 scale-105'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:border-sda-gold/50 hover:text-slate-900 dark:hover:text-white backdrop-blur-sm'
              )}
            >
              {k ? t(kindLabelKey[k]) : t('common.all')}
            </button>
          ))}
        </div>

        {/* Achievement cards */}
        {items.length === 0 ? (
          <div className="text-center py-16 sm:py-20 text-slate-400 dark:text-white/40">
            <p className="text-lg sm:text-xl font-bold">{t('achievements.noItems')}</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <GlassCard delay={0}>
                  <div className="relative h-56 sm:h-72 overflow-hidden">
                    {item.coverUrl ? (
                      <img
                        src={item.coverUrl}
                        alt=""
                        className="h-full w-full object-cover brightness-100 contrast-[1.02] saturate-105 group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-sda-blue/20 to-sda-gold/10 dark:from-sda-blue/30 dark:to-sda-gold/20 flex items-center justify-center">
                        <div className="p-4 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-sm">
                          {kindIcon[item.kind]}
                        </div>
                      </div>
                    )}
                    <div className={cn(
                      'absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-black uppercase backdrop-blur-md shadow-lg',
                      kindColor[item.kind]
                    )}>
                      {kindIcon[item.kind]}
                      {t(kindLabelKey[item.kind])}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 dark:from-black/25 to-transparent pointer-events-none" />
                  </div>
                  <div className="p-4 sm:p-5">
                    <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug group-hover:text-sda-blue dark:group-hover:text-sda-gold transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[11px] sm:text-xs font-bold text-slate-400 dark:text-white/40">{item.author}</p>
                    <p className={cn(
                      'mt-2.5 text-xs sm:text-sm text-slate-600 dark:text-white/60 leading-relaxed font-normal',
                      expanded.has(item.id) ? '' : 'line-clamp-3'
                    )}>
                      {item.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => toggleExpand(item.id)}
                        className="text-xs font-bold text-sda-blue dark:text-sda-gold-light hover:underline"
                      >
                        {expanded.has(item.id) ? t('achievements.showLess') : t('achievements.readMore')}
                      </button>
                      <span className="text-xs font-bold text-slate-400 dark:text-white/40 inline-flex items-center gap-1 group-hover:text-sda-blue dark:group-hover:text-sda-gold transition-colors">
                        View <ArrowUpRight size={12} />
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 py-8 sm:py-12">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <MifemLogo size="md" className="justify-center mb-6 [&_span]:text-slate-900 dark:[&_span]:text-white" />
          <p className="text-sm font-bold text-slate-400 dark:text-white/40">
            {t('home.footer', { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default Home;
