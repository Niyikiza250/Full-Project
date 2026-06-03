import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants/routes';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [isSent, setIsSent] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const forgotPasswordSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
  });
  type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    // Simulate API call
    console.log('Reset link requested for:', data.email);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.forgotCheckEmailHeading')}</h2>
          <p className="text-sm text-slate-500">{t('auth.forgotCheckEmailMessage')}</p>
        </div>
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg transform transition-transform active:scale-95"
        >
          {t('auth.backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.forgotHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.forgotSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.forgotEmailLabel')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              {...register('email')}
              type="email"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all"
              placeholder={t('auth.forgotEmailPlaceholder')}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{t('auth.forgotSending')}</span>
            </>
          ) : (
            <span>{t('auth.forgotSendLink')}</span>
          )}
        </button>
      </form>

      <div className="text-center">
        <Link to={ROUTES.LOGIN} className="inline-flex items-center text-sm text-slate-500 hover:text-sda-blue transition-colors">
          <ArrowLeft size={16} className="mr-2" />
          {t('auth.backToLogin')}
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
