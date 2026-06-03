import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { MOCK_MANAGED_USERS } from '@/data/enterpriseMocks';

const STAFF_ROLES: string[] = ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER'];

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const loginSchema = z.object({
    email: z.string().email(t('auth.validation.emailInvalid')),
    password: z.string().min(6, t('auth.validation.passwordMin')),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoginError(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockUser = MOCK_MANAGED_USERS.find(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (!mockUser) {
      setLoginError(t('auth.validation.emailInvalid'));
      return;
    }

    const isStaffUser = STAFF_ROLES.includes(mockUser.role);

    if (isStaffUser && !isStaff) {
      setLoginError(t('auth.staffCheckboxErrorStaff'));
      return;
    }

    if (!isStaffUser && isStaff) {
      setLoginError(t('auth.staffCheckboxErrorMember'));
      return;
    }

    login({
      id: mockUser.id,
      name: mockUser.name,
      email: data.email,
      role: mockUser.role,
      unionId: mockUser.unionId || 'UM1',
      fieldId: mockUser.fieldId,
      districtId: mockUser.districtId,
      churchId: mockUser.churchId,
      ministryId: mockUser.ministryId,
      volunteerId: mockUser.volunteerId,
    }, 'fake-jwt-token');

    navigate(ROUTES.DASHBOARD);
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

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={isStaff}
            onChange={(e) => setIsStaff(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-sda-blue focus:ring-sda-blue cursor-pointer"
          />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-sda-blue dark:group-hover:text-sda-gold transition-colors">
            {t('auth.staffCheckbox')}
          </span>
        </label>

        {loginError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30" role="alert">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs font-semibold text-red-700 dark:text-red-400">{loginError}</p>
          </div>
        )}

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
      
      {/* Credentials Reference */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 overflow-hidden">
        <div className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30">
            <span>admin@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Super Admin</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
            <span>secretary@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Union Leader</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30">
            <span>conference-leader@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Field Leader</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
            <span>district-leader@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">District Leader</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30">
            <span>church-leader@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Church Leader</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
            <span>ministry-leader@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Ministry Leader</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 bg-white/50 dark:bg-slate-800/30">
            <span>member@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Member</span>
          </div>
          <div className="flex items-center justify-between px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300">
            <span>volunteer@mifem.rw</span>
            <span className="text-sda-blue dark:text-sda-gold">Volunteer</span>
          </div>
        </div>
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-t border-amber-200 dark:border-amber-900/30 flex items-center gap-1.5">
          <Lock size={12} className="text-amber-500 shrink-0" />
          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
            Password: any 6+ characters &bull; Check "Staff/Leader" for leader accounts
          </span>
        </div>
      </div>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">{t('auth.secureEnvironment')}</span>
        </div>
      </div>

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
