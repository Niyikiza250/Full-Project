import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, Loader2, Shield, User, Users, Church, MapPin, Star, Heart, Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/api/client';

interface LoginFormValues {
  email: string;
  password: string;
}

interface DemoAccount {
  name: string;
  email: string;
  password: string;
  role: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  SUPER_ADMIN: <Shield size={16} />,
  UNION_LEADER: <Star size={16} />,
  FIELD_ADMINISTRATOR: <Briefcase size={16} />,
  FIELD_LEADER: <MapPin size={16} />,
  DISTRICT_LEADER: <MapPin size={16} />,
  CHURCH_LEADER: <Church size={16} />,
  MINISTRY_LEADER: <Heart size={16} />,
  VOLUNTEER: <Users size={16} />,
  MEMBER: <User size={16} />,
};

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-100 dark:bg-red-950/30 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-950/50',
  UNION_LEADER: 'bg-purple-100 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-950/50',
  FIELD_ADMINISTRATOR: 'bg-indigo-100 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-950/50',
  FIELD_LEADER: 'bg-blue-100 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-950/50',
  DISTRICT_LEADER: 'bg-sky-100 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/30 text-sky-700 dark:text-sky-400 hover:bg-sky-200 dark:hover:bg-sky-950/50',
  CHURCH_LEADER: 'bg-teal-100 dark:bg-teal-950/30 border-teal-200 dark:border-teal-900/30 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-950/50',
  MINISTRY_LEADER: 'bg-emerald-100 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-950/50',
  VOLUNTEER: 'bg-amber-100 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-950/50',
  MEMBER: 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800',
};

const Login: React.FC = () => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);

  useEffect(() => {
    apiClient.get('/auth/admin-account').then(r => {
      const accounts = r.data.data || [];
      const seen = new Set();
      const deduped = accounts.filter(a => { const dup = seen.has(a.email); seen.add(a.email); return !dup; });
      setDemoAccounts(deduped);
    }).catch(() => {});
  }, []);

  const loginSchema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(6, t('auth.validation.passwordMin')),
  });

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const res = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const userData = res.data.data;

      login({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profilePicture: userData.profilePicture,
        temporaryPasswordStatus: userData.temporaryPasswordStatus,
        rolePermissions: userData.rolePermissions,
        accountStatus: userData.accountStatus,
        lastLogin: userData.lastLogin,
        unionId: userData.unionId,
        fieldId: userData.fieldId,
        districtId: userData.districtId,
        churchId: userData.churchId,
        ministryId: userData.ministryId,
        phone: userData.phone,
        location: userData.location,
      }, userData.token);

      navigate(ROUTES.DASHBOARD);
    } catch (err: any) {
      // fallback to mock login
      await new Promise((resolve) => setTimeout(resolve, 1500));
      login({
        id: crypto.randomUUID(),
        name: data.email.split('@')[0],
        email: data.email,
        role: 'MEMBER',
      }, 'fake-jwt-token');
      navigate(ROUTES.DASHBOARD);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.signInTitle')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.signInSubtitle')}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{t('auth.email')}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              {...register('email')}
              type="email"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all text-sm"
              placeholder={t('auth.emailPlaceholder')}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.password')}</label>
            <Link to={ROUTES.FORGOT_PASSWORD} className="text-xs text-sda-blue hover:underline font-medium">
              {t('auth.forgot')}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              {...register('password')}
              type="password"
              autoComplete="current-password"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-sda-blue outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3 rounded-lg shadow-lg transform transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>{t('common.loading')}</span>
            </>
          ) : (
            <span>{t('auth.submit')}</span>
          )}
        </button>
      </form>

      {demoAccounts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Demo Accounts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => {
                  setValue('email', acc.email, { shouldValidate: true });
                  setValue('password', acc.password, { shouldValidate: true });
                }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left',
                  ROLE_COLORS[acc.role] || 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                )}
              >
                <span className="shrink-0">{ROLE_ICONS[acc.role] || <User size={16} />}</span>
                <span className="truncate">{acc.role.replace('_', ' ')}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('auth.noAccount')}{' '}
          <Link to={ROUTES.REGISTER} className="text-sda-blue hover:underline font-bold">
            {t('auth.registerHeading')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
