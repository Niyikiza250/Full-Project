import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants/routes';
import { Clock, LogIn } from 'lucide-react';

const SessionExpired: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center">
          <Clock size={40} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.sessionExpiredHeading')}</h2>
        <p className="text-slate-500 max-w-xs mx-auto">{t('auth.sessionExpiredSubtitle')}</p>
      </div>

      <button
        onClick={() => navigate(ROUTES.LOGIN)}
        className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all transform active:scale-95"
      >
        <LogIn size={18} />
        <span>{t('auth.sessionExpiredSignIn')}</span>
      </button>

      <p className="text-xs text-slate-400">
        {t('auth.sessionExpiredFooter')}
      </p>
    </div>
  );
};

export default SessionExpired;
