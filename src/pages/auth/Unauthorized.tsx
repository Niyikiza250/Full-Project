import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants/routes';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center">
          <ShieldAlert size={40} />
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('auth.unauthorizedHeading')}</h2>
        <p className="text-slate-500 max-w-xs mx-auto">{t('auth.unauthorizedSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-4">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center space-x-2 transition-all"
        >
          <Home size={18} />
          <span>{t('auth.unauthorizedDashboard')}</span>
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft size={18} />
          <span>{t('auth.unauthorizedGoBack')}</span>
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
