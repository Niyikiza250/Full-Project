import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Lock, Loader2, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const ForcePasswordChange: React.FC = () => {
  const { completePasswordChange, logout, user } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const changePasswordSchema = z.object({
    password: z.string().min(6, t('auth.passwordMinChars', { count: 6 })),
    confirmPassword: z.string().min(6, t('auth.confirmPasswordRequired')),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordsDontMatch'),
    path: ["confirmPassword"],
  });
  type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordFormValues) => {
    try {
      setErrorMsg(null);
      // Simulate API saving the new hashed password
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Update store state
      completePasswordChange();
      
      // Go to dashboard
      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      setErrorMsg(err?.message || t('auth.forcePasswordErrorFailed'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-xl space-y-6"
      >
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-amber-50 dark:bg-amber-950/30 text-amber-500 dark:text-amber-400 rounded-full flex items-center justify-center">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('auth.forcePasswordHeading')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {t('auth.forcePasswordSubtitle')}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-semibold rounded-xl border border-red-100 dark:border-red-900/30">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.forcePasswordNewLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={16} />
              <input
                {...register('password')}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-755 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue transition-all"
                placeholder={t('auth.forcePasswordNewPlaceholder')}
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              {t('auth.forcePasswordConfirmLabel')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500" size={16} />
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-755 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue transition-all"
                placeholder={t('auth.forcePasswordConfirmPlaceholder')}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-[10px] text-red-500 font-bold">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-xl shadow-md cursor-pointer transform active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {t('auth.forcePasswordUpdating')}
                </>
              ) : (
                t('auth.forcePasswordUpdateButton')
              )}
            </button>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              {t('auth.forcePasswordCancelButton')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForcePasswordChange;
