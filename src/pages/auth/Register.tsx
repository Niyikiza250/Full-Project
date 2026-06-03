import React, { useState, useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, Loader2, User, Church, MapPin, ChevronDown, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { MOCK_FIELDS, MOCK_DISTRICTS, MOCK_CHURCHES } from '@/data/enterpriseMocks';
import { motion, AnimatePresence } from 'framer-motion';

interface RegistrationData {
  fieldId: string;
  districtId: string;
  churchId: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const Register: React.FC = () => {
  const { t } = useTranslation();
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegistrationData>({
    fieldId: '',
    districtId: '',
    churchId: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDistricts = useMemo(
    () => MOCK_DISTRICTS.filter((d) => d.fieldId === formData.fieldId),
    [formData.fieldId]
  );

  const availableChurches = useMemo(
    () => MOCK_CHURCHES.filter((c) => c.districtId === formData.districtId),
    [formData.districtId]
  );

  const selectedField = MOCK_FIELDS.find((f) => f.id === formData.fieldId);
  const selectedDistrict = MOCK_DISTRICTS.find((d) => d.id === formData.districtId);
  const selectedChurch = MOCK_CHURCHES.find((c) => c.id === formData.churchId);

  const fieldSelected = !!formData.fieldId;
  const districtSelected = !!formData.districtId;
  const churchSelected = !!formData.churchId;
  const canSubmit = fieldSelected && districtSelected && churchSelected;

  const handleSelectChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'fieldId') { next.districtId = ''; next.churchId = ''; }
      if (field === 'districtId') { next.churchId = ''; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.fieldId) errs.fieldId = t('auth.fieldRequired');
    if (!formData.districtId) errs.districtId = t('auth.districtRequired');
    if (!formData.churchId) errs.churchId = t('auth.churchRequired');
    if (formData.fullName.length < 2) errs.fullName = t('auth.validation.fullNameMin');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = t('auth.validation.emailInvalid');
    if (formData.password.length < 6) errs.password = t('auth.validation.passwordMin');
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.validation.passwordsDontMatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    login({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.fullName,
      email: formData.email,
      role: 'MEMBER',
      fieldId: formData.fieldId,
      churchId: formData.churchId,
      zoneId: MOCK_DISTRICTS.find((d) => d.id === formData.districtId)?.id,
    }, 'fake-jwt-token');

    setIsSubmitting(false);
    navigate(ROUTES.DASHBOARD);
  };

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.registerHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.registerSubtitle')}</p>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((s) => (
          <React.Fragment key={s}>
            <div className={cn(
              'flex-1 h-1.5 rounded-full transition-all duration-500',
              (s === 1 && fieldSelected) || (s === 1) ? 'bg-sda-blue' :
              (s === 2 && districtSelected) || (s <= 2) ? 'bg-sda-blue' :
              (s === 3 && churchSelected) || (s <= 3) ? 'bg-sda-blue' :
              (s === 4 && canSubmit) ? 'bg-sda-blue' :
              'bg-slate-200 dark:bg-slate-700'
            )} />
          </React.Fragment>
        ))}
      </div>

      {/* ====== SECTION 1: Mission Field ====== */}
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
          {t('auth.fieldLabel')}
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
          <select
            value={formData.fieldId}
            onChange={(e) => handleSelectChange('fieldId', e.target.value)}
            className={cn(
              'w-full pl-11 pr-10 py-3.5 rounded-xl border-2 appearance-none text-sm font-semibold transition-all duration-200 outline-none cursor-pointer',
              'bg-sda-blue text-white border-sda-blue-dark hover:border-sda-gold/50 focus:border-sda-gold focus:ring-2 focus:ring-sda-gold/20',
              formData.fieldId && 'border-sda-gold/60'
            )}
          >
              <option value="" className="bg-sda-blue text-slate-300">{t('auth.fieldPlaceholder')}</option>
            {MOCK_FIELDS.map((f) => (
              <option key={f.id} value={f.id} className="bg-sda-blue text-white py-2">{f.name}</option>
            ))}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        {errors.fieldId && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.fieldId}</p>}
      </div>

      {/* ====== SECTION 2: District (auto-reveal) ====== */}
      <AnimatePresence>
        {fieldSelected && (
          <motion.div
            {...slideUp}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="space-y-1"
          >
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('auth.districtLabel')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
              <select
                value={formData.districtId}
                onChange={(e) => handleSelectChange('districtId', e.target.value)}
                className={cn(
                  'w-full pl-11 pr-10 py-3.5 rounded-xl border-2 appearance-none text-sm font-semibold transition-all duration-200 outline-none cursor-pointer',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700',
                  'hover:border-sda-blue/50 dark:hover:border-sda-gold/50 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20',
                  formData.districtId && 'border-sda-blue dark:border-sda-gold'
                )}
              >
                <option value="">{t('auth.districtPlaceholder')}</option>
                {availableDistricts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.districtId && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.districtId}</p>}
            {availableDistricts.length === 0 && (
              <p className="text-xs text-slate-400 italic mt-1">{t('auth.districtPlaceholder')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== SECTION 3: Church (auto-reveal) ====== */}
      <AnimatePresence>
        {districtSelected && (
          <motion.div
            {...slideUp}
            transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }}
            className="space-y-1"
          >
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              {t('auth.churchLabel')}
            </label>
            <div className="relative">
              <Church className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
              <select
                value={formData.churchId}
                onChange={(e) => handleSelectChange('churchId', e.target.value)}
                className={cn(
                  'w-full pl-11 pr-10 py-3.5 rounded-xl border-2 appearance-none text-sm font-semibold transition-all duration-200 outline-none cursor-pointer',
                  'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700',
                  'hover:border-sda-blue/50 dark:hover:border-sda-gold/50 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20',
                  formData.churchId && 'border-sda-blue dark:border-sda-gold'
                )}
              >
                <option value="">{t('auth.churchPlaceholder')}</option>
                {availableChurches.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.churchId && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.churchId}</p>}
            {availableChurches.length === 0 && (
              <p className="text-xs text-slate-400 italic mt-1">{t('auth.churchPlaceholder')}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====== SECTION 4: Account Details (auto-reveal) ====== */}
      <AnimatePresence>
        {churchSelected && (
          <motion.div
            {...slideUp}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            className="space-y-4"
          >
            {/* Selection summary */}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-sda-blue/5 dark:bg-sda-gold/5 border border-sda-blue/10 dark:border-sda-gold/10 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <Info size={14} className="text-sda-blue dark:text-sda-gold shrink-0" />
              <span>{selectedField?.name} &rsaquo; {selectedDistrict?.name} &rsaquo; {selectedChurch?.name}</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.fullName')}</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => { setFormData((p) => ({ ...p, fullName: e.target.value })); setErrors((p) => ({ ...p, fullName: '' })); }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all"
                  placeholder={t('auth.fullNamePlaceholder')}
                />
              </div>
              {errors.fullName && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => { setFormData((p) => ({ ...p, email: e.target.value })); setErrors((p) => ({ ...p, email: '' })); }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all"
                  placeholder={t('auth.emailPlaceholder')}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.password')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => { setFormData((p) => ({ ...p, password: e.target.value })); setErrors((p) => ({ ...p, password: '' })); }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </div>
                {errors.password && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t('auth.confirmPassword')}</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => { setFormData((p) => ({ ...p, confirmPassword: e.target.value })); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all"
                    placeholder={t('auth.passwordPlaceholder')}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full bg-sda-blue hover:bg-sda-blue-dark text-white font-bold py-3.5 rounded-xl shadow-lg shadow-sda-blue/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t('auth.registering')}</span>
                </>
              ) : (
                <span>{t('auth.signUp')}</span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('auth.hasAccount')}{' '}
          <Link to={ROUTES.LOGIN} className="text-sda-blue hover:underline font-bold">
            {t('auth.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
