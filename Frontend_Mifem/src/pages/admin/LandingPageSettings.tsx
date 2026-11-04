import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import HeroSlideManager from '@/components/admin/HeroSlideManager';
import { AchievementManager } from '@/components/admin/AchievementManager';

const LandingPageSettings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('settings.landingPage', 'Landing Page')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.landingPageManagementDesc', 'Control what appears on the public homepage. Manage hero slides and featured content.')}
        </p>
      </div>

      <HeroSlideManager />

      <AchievementManager />
    </motion.div>
  );
};

export default LandingPageSettings;
