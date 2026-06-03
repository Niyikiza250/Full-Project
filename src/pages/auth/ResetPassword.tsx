import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/constants/routes';
import { Lock, Loader2, ShieldCheck } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const resetPasswordSchema = z.object({
    password: z.string().min(8, t('auth.passwordMinChars', { count: 8 })),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsDontMatch'),
    path: ["confirmPassword"],
  });
  type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    // Simulate API call
    console.log('Password reset for:', data.password);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    navigate(ROUTES.LOGIN);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.resetHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.resetSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.resetNewPasswordLabel')}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              {...register('password')}
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all"
              placeholder={t('auth.resetPasswordPlaceholder')}
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.resetConfirmPasswordLabel')}</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all"
              placeholder={t('auth.resetPasswordPlaceholder')}
            />
          </div>
          {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{t('auth.resetUpdating')}</span>
            </>
          ) : (
            <span>{t('auth.resetUpdateButton')}</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
