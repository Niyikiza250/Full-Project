import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Loader2, User, Church, MapPin, Heart, Shield, Lock, Check, AlertCircle, ArrowLeft, ArrowRight, Camera, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useFields, useDistricts, useChurches } from '@/services/locationService';
import { motion, AnimatePresence } from 'framer-motion';
import { useRwandaLocation } from '@/hooks/useRwandaLocation';
import apiClient from '@/api/client';
import { useAuthStore } from '@/store/useAuthStore';
import { clsx } from 'clsx';
import { SectionHeader, FormField } from '@/components/forms/FormField';
import { fieldClass } from '@/lib/fieldStyles';
import { MinistryRole, MINISTRY_ROLE_LABELS, calculateAgeGroup, AgeGroup, AGE_GROUP_LABELS } from '@/types/member';

type AccountType = 'member' | 'volunteer';
const STEP_COUNT = 5;

const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const shakeAnimation = `
@keyframes shake-error {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
}
.animate-shake { animation: shake-error 0.4s ease-in-out; }
`;

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const rwandaLocation = useRwandaLocation();

  const [accountType, setAccountType] = useState<AccountType>(
    (searchParams.get('type') as AccountType) || 'member'
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);
  const [shakingField, setShakingField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    gender: '' as 'MALE' | 'FEMALE' | '',
    dateOfBirth: '',
    ageGroup: '' as AgeGroup | '',
    churchId: '',
    sabbathClass: '',
    baptismDate: '',
    village: '',
    sector: '',
    district: '',
    emergencyName: '',
    emergencyPhone: '',
    password: '',
    confirmPassword: '',
    ministryRoles: [] as string[],
  });

  const [volLocation, setVolLocation] = useState({
    provinceCode: null as number | null,
    provinceName: null as string | null,
    districtCode: null as number | null,
    districtName: null as string | null,
    sectorCode: null as string | null,
    sectorName: null as string | null,
    cellCode: null as number | null,
    cellName: null as string | null,
    villageCode: null as number | null,
    villageName: null as string | null,
  });

  const { data: fieldsData } = useFields({ limit: 100 });
  const { data: districtsData } = useDistricts({ limit: 500 });
  const { data: churchesData } = useChurches({ limit: 1000 });

  const fields = useMemo(() => fieldsData?.data ?? [], [fieldsData]);
  const allDistricts = useMemo(() => districtsData?.data ?? [], [districtsData]);
  const allChurches = useMemo(() => churchesData?.data ?? [], [churchesData]);

  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [selectedDistrictId, setSelectedDistrictId] = useState('');

  const availableDistricts = useMemo(
    () => allDistricts.filter((d) => d.fieldId === selectedFieldId),
    [allDistricts, selectedFieldId]
  );
  const availableChurches = useMemo(
    () => allChurches.filter((c) => c.districtId === selectedDistrictId),
    [allChurches, selectedDistrictId]
  );

  const provinces = useMemo(() => rwandaLocation?.getProvinces() ?? [], [rwandaLocation]);
  const volDistricts = useMemo(
    () => (rwandaLocation && volLocation.provinceCode ? rwandaLocation.getDistricts(volLocation.provinceCode) : []),
    [rwandaLocation, volLocation.provinceCode]
  );
  const volSectors = useMemo(
    () => (rwandaLocation && volLocation.districtCode ? rwandaLocation.getSectors(volLocation.districtCode) : []),
    [rwandaLocation, volLocation.districtCode]
  );
  const volCells = useMemo(
    () => (rwandaLocation && volLocation.sectorCode ? rwandaLocation.getCells(volLocation.sectorCode) : []),
    [rwandaLocation, volLocation.sectorCode]
  );
  const volVillages = useMemo(
    () => (rwandaLocation && volLocation.cellCode ? rwandaLocation.getVillages(volLocation.cellCode) : []),
    [rwandaLocation, volLocation.cellCode]
  );

  const autoAgeGroup = useMemo(() => {
    if (formData.dateOfBirth) return calculateAgeGroup(formData.dateOfBirth);
    return null;
  }, [formData.dateOfBirth]);

  const touch = useCallback((field: string) => {
    setTouched((prev) => {
      if (prev.has(field)) return prev;
      const next = new Set(prev);
      next.add(field);
      return next;
    });
  }, []);

  const validateSingleField = useCallback((field: string): string => {
    switch (field) {
      case 'firstName':
        if (!formData.firstName || formData.firstName.length < 2) return t('auth.validation.fullNameMin');
        break;
      case 'lastName':
        if (!formData.lastName || formData.lastName.length < 2) return t('auth.validation.fullNameMin');
        break;
      case 'phone':
        if (!formData.phone || formData.phone.length < 10) return 'Valid phone number is required (+250...)';
        break;
      case 'gender':
        if (!formData.gender) return t('member.validation.genderRequired', 'Gender is required');
        break;
      case 'email':
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return t('auth.validation.emailInvalid');
        break;
      case 'password':
        if (!formData.password || formData.password.length < 6) return t('auth.validation.passwordMin');
        break;
      case 'confirmPassword':
        if (formData.password !== formData.confirmPassword) return t('auth.validation.passwordsDontMatch');
        break;
      case 'emergencyName':
        if (!formData.emergencyName || formData.emergencyName.length < 2) return 'Emergency contact name is required';
        break;
      case 'emergencyPhone':
        if (!formData.emergencyPhone || formData.emergencyPhone.length < 10) return 'Emergency contact phone is required';
        break;
      case 'fieldId':
        if (!selectedFieldId) return t('auth.fieldRequired');
        break;
      case 'districtId':
        if (!selectedDistrictId) return t('auth.districtRequired');
        break;
      case 'churchId':
        if (!formData.churchId) return t('auth.churchRequired');
        break;
      case 'volProvince':
        if (!volLocation.provinceCode) return 'Province is required';
        break;
      case 'volDistrict':
        if (!volLocation.districtCode) return 'District is required';
        break;
      case 'volSector':
        if (!volLocation.sectorCode) return 'Sector is required';
        break;
      case 'volCell':
        if (!volLocation.cellCode) return 'Cell is required';
        break;
      case 'volVillage':
        if (!volLocation.villageCode) return 'Village is required';
        break;
    }
    return '';
  }, [formData, selectedFieldId, selectedDistrictId, volLocation, t]);

  const onFieldBlur = useCallback((field: string) => {
    touch(field);
    const err = validateSingleField(field);
    setErrors((prev) => {
      if (err && !prev[field]) return { ...prev, [field]: err };
      if (!err && prev[field]) {
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return prev;
    });
  }, [touch, validateSingleField]);

  const showFieldError = useCallback((field: string): string => {
    if (!touched.has(field) && !errors[field]) return '';
    return errors[field] || '';
  }, [touched, errors]);

  // Auto-save form draft (called from update functions, not an effect)
  const saveDraft = useCallback((data: typeof formData, type: AccountType, step: number, loc: typeof volLocation) => {
    try {
      localStorage.setItem('register-form-draft', JSON.stringify({ formData: data, accountType: type, currentStep: step, volLocation: loc }));
      setAutoSaved(true);
      setTimeout(() => setAutoSaved(false), 2000);
    } catch { /* localStorage full */ }
  }, []);

  const update = useCallback((field: string, value: string | string[]) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      saveDraft(next, accountType, currentStep, volLocation);
      return next;
    });
    if (touched.has(field)) {
      setTimeout(() => {
        const err = validateSingleField(field);
        setErrors((prev) => {
          if (err) return { ...prev, [field]: err };
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }, 0);
    }
  }, [touched, validateSingleField, accountType, currentStep, volLocation, saveDraft]);

  const steps = useMemo(() => [
    {
      title: t('auth.stepAccountType', 'Account Type'),
      subtitle: t('auth.stepAccountTypeSubtitle', 'Member or Volunteer'),
      icon: <User size={18} />,
      fields: [] as string[],
    },
    {
      title: t('member.stepPersonal', 'Personal Info'),
      subtitle: t('member.stepPersonalSubtitle', 'Name, contact, gender, age'),
      icon: <User size={18} />,
      fields: ['firstName', 'lastName', 'phone', 'gender', 'dateOfBirth'],
    },
    {
      title: accountType === 'member'
        ? t('auth.stepChurchLocation', 'Church Location')
        : t('auth.stepVolunteerLocation', 'Your Location'),
      subtitle: accountType === 'member'
        ? t('auth.stepChurchLocationSubtitle', 'Field, district, church')
        : t('auth.stepVolunteerLocationSubtitle', 'Province to village'),
      icon: <MapPin size={18} />,
      fields: accountType === 'member'
        ? ['fieldId', 'districtId', 'churchId']
        : ['volProvince', 'volDistrict', 'volSector', 'volCell', 'volVillage'],
    },
    {
      title: t('member.stepChurchAffiliation', 'Church Affiliation'),
      subtitle: t('member.stepChurchAffiliationSubtitle', 'Church, ministry, role'),
      icon: <Church size={18} />,
      fields: ['churchId', 'ministryRoles'],
    },
    {
      title: t('auth.stepCredentials', 'Account & Emergency'),
      subtitle: t('auth.stepCredentialsSubtitle', 'Password and emergency contact'),
      icon: <Lock size={18} />,
      fields: ['email', 'password', 'confirmPassword', 'emergencyName', 'emergencyPhone'],
    },
  ], [t, accountType]);

  const validateStep = useCallback((step: number): boolean => {
    const errs: Record<string, string> = {};
    const stepFields = steps[step - 1]?.fields ?? [];
    const newTouched = new Set(touched);

    stepFields.forEach((f) => {
      if (f !== 'ministryRoles') newTouched.add(f);
    });
    setTouched(newTouched);

    if (step === 1) {
      // Account type - always valid
    }

    if (step === 2) {
      if (!formData.firstName || formData.firstName.length < 2) errs.firstName = t('auth.validation.fullNameMin');
      if (!formData.lastName || formData.lastName.length < 2) errs.lastName = t('auth.validation.fullNameMin');
      if (!formData.phone || formData.phone.length < 10) errs.phone = 'Valid phone number is required (+250...)';
      if (!formData.gender) errs.gender = t('member.validation.genderRequired', 'Gender is required');
    }

    if (step === 3) {
      if (accountType === 'member') {
        if (!selectedFieldId) errs.fieldId = t('auth.fieldRequired');
        if (!selectedDistrictId) errs.districtId = t('auth.districtRequired');
        if (!formData.churchId) errs.churchId = t('auth.churchRequired');
      } else {
        if (!volLocation.provinceCode) errs.volProvince = 'Province is required';
        if (!volLocation.districtCode) errs.volDistrict = 'District is required';
        if (!volLocation.sectorCode) errs.volSector = 'Sector is required';
        if (!volLocation.cellCode) errs.volCell = 'Cell is required';
        if (!volLocation.villageCode) errs.volVillage = 'Village is required';
      }
    }

    if (step === 4) {
      if (!formData.churchId) errs.churchId = t('auth.churchRequired');
    }

    if (step === 5) {
      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = t('auth.validation.emailInvalid');
      if (!formData.password || formData.password.length < 6) errs.password = t('auth.validation.passwordMin');
      if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.validation.passwordsDontMatch');
      if (!formData.emergencyName || formData.emergencyName.length < 2) errs.emergencyName = 'Emergency contact name is required';
      if (!formData.emergencyPhone || formData.emergencyPhone.length < 10) errs.emergencyPhone = 'Emergency contact phone is required';
    }

    setErrors((prev) => ({ ...prev, ...errs }));

    if (Object.keys(errs).length > 0) {
      const firstErrField = Object.keys(errs)[0];
      setShakingField(firstErrField);
      setTimeout(() => setShakingField(null), 500);
    }

    return Object.keys(errs).length === 0;
  }, [formData, accountType, selectedFieldId, selectedDistrictId, volLocation, t, steps, touched]);

  const getStepHasError = useCallback((stepIndex: number): boolean => {
    const stepFields = steps[stepIndex]?.fields ?? [];
    return stepFields.some((f) => f !== 'ministryRoles' && showFieldError(f) !== '');
  }, [steps, showFieldError]);

  const handleNext = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEP_COUNT));
    }
  }, [currentStep, validateStep]);

  const handlePrev = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  }, []);

  const toggleMinistryRole = useCallback((role: string) => {
    setFormData((prev) => {
      const current = prev.ministryRoles;
      const updated = current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
      return { ...prev, ministryRoles: updated };
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    setServerError(null);

    const name = `${formData.firstName} ${formData.lastName}`.trim();
    const fullPhone = formData.phone.startsWith('+') ? formData.phone : `+250${formData.phone.replace(/^0/, '')}`;

    const basePayload: Record<string, unknown> = {
      name,
      email: formData.email,
      password: formData.password,
      phone: fullPhone,
      firstName: formData.firstName,
      lastName: formData.lastName,
      gender: formData.gender || undefined,
      dateOfBirth: formData.dateOfBirth || undefined,
      whatsapp: formData.whatsapp || undefined,
      sabbathClass: formData.sabbathClass || undefined,
      baptismDate: formData.baptismDate || undefined,
      village: formData.village || undefined,
      sector: formData.sector || undefined,
      district: formData.district || undefined,
      emergencyName: formData.emergencyName,
      emergencyPhone: formData.emergencyPhone.startsWith('+') ? formData.emergencyPhone : `+250${formData.emergencyPhone.replace(/^0/, '')}`,
      ministryRoles: formData.ministryRoles,
      imageUrl: imagePreview || undefined,
    };

    try {
      let response;
      if (accountType === 'member') {
        const { data } = await apiClient.post('/auth/register/member', {
          ...basePayload,
          churchId: formData.churchId || undefined,
          fieldId: selectedFieldId || undefined,
          districtId: selectedDistrictId || undefined,
        });
        response = data;
      } else {
        const { data } = await apiClient.post('/auth/register/volunteer', {
          ...basePayload,
          provinceCode: volLocation.provinceCode,
          provinceName: volLocation.provinceName,
          districtCode: volLocation.districtCode,
          districtName: volLocation.districtName,
          sectorCode: volLocation.sectorCode,
          sectorName: volLocation.sectorName,
          cellCode: volLocation.cellCode,
          cellName: volLocation.cellName,
          villageCode: volLocation.villageCode,
          villageName: volLocation.villageName,
        });
        response = data;
      }
      localStorage.removeItem('register-form-draft');
      const userData = response.data;
      if (userData?.token) {
        login({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          role: userData.role || accountType === 'volunteer' ? 'VOLUNTEER' : 'MEMBER',
          churchId: userData.churchId,
          accountStatus: userData.accountStatus,
        }, userData.token);
        navigate(ROUTES.DASHBOARD);
      } else {
        navigate(ROUTES.LOGIN);
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { message?: string; errors?: string | { field?: string; message?: string }[] } }; message?: string };
      const statusCode = axiosErr.response?.status;
      const msg = axiosErr.response?.data?.message
        || axiosErr.message
        || 'Registration failed';
      const detail = typeof axiosErr.response?.data?.errors === 'string'
        ? axiosErr.response.data.errors
        : Array.isArray(axiosErr.response?.data?.errors)
          ? axiosErr.response.data.errors.map((e) => typeof e === 'string' ? e : e.message).join(', ')
          : '';
      let displayMsg = detail ? `${msg} — ${detail}` : msg;
      if (statusCode === 409) {
        displayMsg = 'An account with this email already exists. Please use a different email or sign in.';
      } else if (statusCode === 400) {
        displayMsg = detail || msg || 'Please check your form fields and try again.';
      } else if (!statusCode || statusCode >= 500) {
        displayMsg = 'A server error occurred. Please try again later.';
      }
      setServerError(displayMsg);
      console.error('Registration error:', axiosErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressPercent = Math.round((currentStep / STEP_COUNT) * 100);

  return (
    <div className="space-y-5">
      <style>{shakeAnimation}</style>
      {/* Header */}
      <div className="text-center lg:text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t('auth.registerHeading')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          {t('auth.registerSubtitle')}
        </p>
      </div>

      {/* Step Progress Indicator */}
      <div className="rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
            {t('member.stepProgress', { step: currentStep, total: STEP_COUNT })}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sda-blue">
            <span className="w-1.5 h-1.5 rounded-full bg-sda-blue" />
            {progressPercent}%
          </span>
        </div>

        <div className="relative pt-1">
          {/* Connecting progress line */}
          <div className="absolute left-5 right-5 top-7 h-1 rounded-full bg-slate-200 dark:bg-slate-700" aria-hidden="true">
            <div
              className="h-full bg-gradient-to-r from-sda-blue to-sda-blue-dark rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="relative flex items-start justify-between">
            {steps.map((step, index) => {
              const stepNum = index + 1;
              const isCompleted = stepNum < currentStep;
              const isCurrent = stepNum === currentStep;
              const hasError = !isCurrent && stepNum > currentStep && getStepHasError(index);
              return (
                <button
                  key={step.title}
                  type="button"
                  onClick={() => { if (stepNum < currentStep) setCurrentStep(stepNum); }}
                  className={clsx(
                    'flex flex-col items-center gap-1.5 flex-1 transition-all',
                    stepNum < currentStep ? 'cursor-pointer' : 'cursor-default',
                  )}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={clsx(
                    'relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                    isCompleted && 'bg-gradient-to-br from-sda-blue to-sda-blue-dark text-white shadow-lg shadow-sda-blue/25 ring-4 ring-sda-blue/10',
                    isCurrent && 'bg-gradient-to-br from-sda-blue to-sda-blue-dark text-white shadow-lg shadow-sda-blue/30 ring-4 ring-sda-blue/15 scale-105',
                    !isCompleted && !isCurrent && hasError && 'bg-white dark:bg-slate-800 text-red-500 border-2 border-red-200 dark:border-red-700',
                    !isCompleted && !isCurrent && !hasError && 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700',
                  )}>
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : <span className="scale-75">{step.icon}</span>}
                    {isCurrent && (
                      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-sda-gold ring-2 ring-white dark:ring-slate-900" />
                    )}
                    {hasError && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center">
                        <AlertCircle size={9} className="text-white" />
                      </span>
                    )}
                  </span>
                  <span className={clsx(
                    'hidden sm:block text-[10px] font-bold text-center leading-tight max-w-[70px]',
                    isCurrent ? 'text-sda-blue' : isCompleted ? 'text-slate-600 dark:text-slate-300' : hasError ? 'text-red-500' : 'text-slate-400 dark:text-slate-500',
                  )}>
                    {step.title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {autoSaved && (
        <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/40 rounded-lg px-3 py-2" role="status" aria-live="polite">
          <Check size={14} /> {t('member.autoSaved', 'Draft saved')}
        </div>
      )}

      {serverError && (
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm font-medium text-red-700 dark:text-red-400" role="alert">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl lg:rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.12)] p-5 sm:p-7">
        <AnimatePresence mode="wait" initial={false}>

        {/* Step 1: Account Type */}
        {currentStep === 1 && (
          <motion.div key="step-1" {...slideUp} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="space-y-6" role="group" aria-label="Account Type">
            <SectionHeader
              icon={<User size={18} />}
              title={t('auth.stepAccountType', 'Account Type')}
              subtitle={t('auth.stepAccountTypeSubtitle', 'Choose how you want to join')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <motion.button
                type="button"
                onClick={() => { setAccountType('member'); setFormData((p) => ({ ...p, churchId: '' })); setSelectedFieldId(''); setSelectedDistrictId(''); }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'relative p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/20',
                  accountType === 'member'
                    ? 'border-sda-blue bg-gradient-to-br from-sda-blue/[0.06] to-sda-blue/[0.02] shadow-lg shadow-sda-blue/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sda-blue/50 hover:shadow-md hover:-translate-y-0.5',
                )}
              >
                <span className={clsx(
                  'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  accountType === 'member' ? 'border-sda-blue bg-sda-blue' : 'border-slate-300 dark:border-slate-600',
                )}>
                  {accountType === 'member' && <Check size={12} strokeWidth={3.5} className="text-white" />}
                </span>
                <span className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                  accountType === 'member' ? 'bg-sda-blue text-white shadow-lg shadow-sda-blue/25' : 'bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold',
                )}>
                  <Church size={24} />
                </span>
                <p className={clsx('font-bold text-sm', accountType === 'member' ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-700 dark:text-slate-300')}>
                  {t('auth.accountTypeMember', 'Member')}
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Church member with local congregation</p>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => { setAccountType('volunteer'); setFormData((p) => ({ ...p, churchId: '' })); }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'relative p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/20',
                  accountType === 'volunteer'
                    ? 'border-sda-blue bg-gradient-to-br from-sda-blue/[0.06] to-sda-blue/[0.02] shadow-lg shadow-sda-blue/10'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-sda-blue/50 hover:shadow-md hover:-translate-y-0.5',
                )}
              >
                <span className={clsx(
                  'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
                  accountType === 'volunteer' ? 'border-sda-blue bg-sda-blue' : 'border-slate-300 dark:border-slate-600',
                )}>
                  {accountType === 'volunteer' && <Check size={12} strokeWidth={3.5} className="text-white" />}
                </span>
                <span className={clsx(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-all',
                  accountType === 'volunteer' ? 'bg-sda-blue text-white shadow-lg shadow-sda-blue/25' : 'bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold',
                )}>
                  <Heart size={24} />
                </span>
                <p className={clsx('font-bold text-sm', accountType === 'volunteer' ? 'text-sda-blue dark:text-sda-gold' : 'text-slate-700 dark:text-slate-300')}>
                  {t('auth.accountTypeVolunteer', 'Volunteer')}
                </p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">Serve across the mission field</p>
              </motion.button>
            </div>
          </div>
          </motion.div>
        )}

        {/* Step 2: Personal Information */}
        {currentStep === 2 && (
          <motion.div key="step-2" {...slideUp} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="space-y-6" role="group" aria-label="Personal Information">
            <SectionHeader
              icon={<User size={18} />}
              title={t('member.formPersonalInfo', 'Personal Information')}
              subtitle={t('member.formPersonalInfoSubtitle', 'Basic personal details')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('member.formFirstName', 'First Name')} required error={showFieldError('firstName')}>
                <input
                  value={formData.firstName}
                  onChange={(e) => update('firstName', e.target.value)}
                  onBlur={() => onFieldBlur('firstName')}
                  placeholder={t('member.formFirstNamePlaceholder', 'e.g. Jean')}
                  className={clsx(fieldClass(showFieldError('firstName') ? { message: showFieldError('firstName') } : undefined), shakingField === 'firstName' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>

              <FormField label={t('member.formLastName', 'Last Name')} required error={showFieldError('lastName')}>
                <input
                  value={formData.lastName}
                  onChange={(e) => update('lastName', e.target.value)}
                  onBlur={() => onFieldBlur('lastName')}
                  placeholder={t('member.formLastNamePlaceholder', 'e.g. Niyomugabo')}
                  className={clsx(fieldClass(showFieldError('lastName') ? { message: showFieldError('lastName') } : undefined), shakingField === 'lastName' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>

              <FormField label={t('member.formPhone', 'Phone Number')} required error={showFieldError('phone')} hint="+250XXXXXXXXX">
                <input
                  value={formData.phone}
                  onChange={(e) => update('phone', e.target.value)}
                  onBlur={() => onFieldBlur('phone')}
                  placeholder="+250788123456"
                  className={clsx(fieldClass(showFieldError('phone') ? { message: showFieldError('phone') } : undefined), shakingField === 'phone' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>

              <FormField label={t('member.formWhatsApp', 'WhatsApp')} error={showFieldError('whatsapp')} hint={t('member.formWhatsAppHint', 'Optional')}>
                <input
                  value={formData.whatsapp}
                  onChange={(e) => update('whatsapp', e.target.value)}
                  placeholder="+250788123456"
                  className={fieldClass()}
                />
              </FormField>

              <FormField label={t('member.formGender', 'Gender')} required error={showFieldError('gender')}>
                <div className={clsx('grid grid-cols-2 gap-2 p-1.5 rounded-xl border transition-all', showFieldError('gender') ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50', shakingField === 'gender' && 'animate-shake')} role="radiogroup" onBlur={() => onFieldBlur('gender')}>
                  {(['MALE', 'FEMALE'] as const).map((g) => {
                    const selected = formData.gender === g;
                    return (
                      <label key={g} className={clsx(
                        'flex items-center justify-center gap-2 cursor-pointer rounded-lg px-4 py-2.5 transition-all text-sm font-semibold select-none focus-within:ring-2 focus-within:ring-sda-blue/30',
                        selected
                          ? 'bg-white dark:bg-slate-800 text-sda-blue shadow-sm border border-sda-blue/30'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
                      )}>
                        <span className={clsx('w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all shrink-0', selected ? 'border-sda-blue' : 'border-slate-300 dark:border-slate-600')}>
                          {selected && <span className="w-2 h-2 rounded-full bg-sda-blue" />}
                        </span>
                        <span>{g === 'MALE' ? t('member.formMale', 'Male') : t('member.formFemale', 'Female')}</span>
                        <input
                          type="radio"
                          value={g}
                          checked={selected}
                          onChange={() => { update('gender', g); touch('gender'); }}
                          className="sr-only"
                        />
                      </label>
                    );
                  })}
                </div>
              </FormField>

              <FormField label={t('member.formDateOfBirth', 'Date of Birth')} error={showFieldError('dateOfBirth')}>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => update('dateOfBirth', e.target.value)}
                  className={fieldClass()}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              <FormField label={t('member.formAgeGroup', 'Age Group')} hint={autoAgeGroup ? t('member.ageGroupAuto', 'Auto-calculated') : ''}>
                <select
                  value={formData.ageGroup || autoAgeGroup || ''}
                  onChange={(e) => update('ageGroup', e.target.value)}
                  className={fieldClass()}
                >
                  <option value="">{t('member.selectAgeGroup', 'Select age group')}</option>
                  {(Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][]).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                {autoAgeGroup && (
                  <p className="mt-1.5 text-xs text-green-600 dark:text-green-400 font-semibold flex items-center gap-1">
                    <Check size={12} /> {t('member.autoCalculated', { group: AGE_GROUP_LABELS[autoAgeGroup] })}
                  </p>
                )}
              </FormField>
            </div>

            {/* Profile Photo */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
              <FormField label={t('member.formPhoto', 'Profile Photo')}>
                <div className="flex items-center gap-5">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group transition-colors hover:border-sda-blue/50">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera size={28} className="text-slate-300" />
                      )}
                      <label className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer gap-1">
                        <Upload size={18} className="text-white" />
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                        <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => setImagePreview(null)}
                        className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg ring-2 ring-white dark:ring-slate-900 transition-colors"
                        aria-label="Remove photo"
                      >
                        <X size={10} />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    {t('member.formPhotoHint', 'Optional. JPG or PNG.')}
                  </p>
                </div>
              </FormField>
            </div>
          </div>
          </motion.div>
        )}

        {/* Step 3: Location (Member: Field/District/Church, Volunteer: Rwanda cascade) */}
        {currentStep === 3 && (
          <motion.div key="step-3" {...slideUp} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="space-y-6" role="group" aria-label="Location">
            <SectionHeader
              icon={<MapPin size={18} />}
              title={accountType === 'member'
                ? t('auth.stepChurchLocation', 'Church Location')
                : t('auth.stepVolunteerLocation', 'Your Location')}
              subtitle={accountType === 'member'
                ? t('auth.stepChurchLocationSubtitle', 'Select your mission field hierarchy')
                : t('auth.stepVolunteerLocationSubtitle', 'Rwanda administrative location')}
            />

            {accountType === 'member' ? (
              <div className="space-y-4">
                <FormField label={t('auth.fieldLabel', 'Mission Field')} required error={showFieldError('fieldId')}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
                    <select
                      value={selectedFieldId}
                      onChange={(e) => {
                        setSelectedFieldId(e.target.value);
                        setSelectedDistrictId('');
                        update('churchId', '');
                        touch('fieldId');
                      }}
                      onBlur={() => onFieldBlur('fieldId')}
                      className={clsx(fieldClass(showFieldError('fieldId') ? { message: showFieldError('fieldId') } : undefined), 'pl-9', shakingField === 'fieldId' && 'animate-shake')}
                    >
                      <option value="">{t('auth.fieldPlaceholder', 'Choose your field...')}</option>
                      {fields.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </FormField>

                <AnimatePresence>
                  {selectedFieldId && (
                    <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                      <FormField label={t('auth.districtLabel', 'District')} required error={showFieldError('districtId')}>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
                          <select
                            value={selectedDistrictId}
                            onChange={(e) => {
                              setSelectedDistrictId(e.target.value);
                              update('churchId', '');
                              touch('districtId');
                            }}
                            onBlur={() => onFieldBlur('districtId')}
                            className={clsx(fieldClass(showFieldError('districtId') ? { message: showFieldError('districtId') } : undefined), 'pl-9', shakingField === 'districtId' && 'animate-shake')}
                          >
                            <option value="">{t('auth.districtPlaceholder', 'Choose your district...')}</option>
                            {availableDistricts.map((d) => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {selectedDistrictId && (
                    <motion.div {...slideUp} transition={{ duration: 0.3, delay: 0.05 }}>
                      <FormField label={t('auth.churchLabel', 'Local Church')} required error={showFieldError('churchId')}>
                        <div className="relative">
                          <Church className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
                          <select
                            value={formData.churchId}
                            onChange={(e) => { update('churchId', e.target.value); touch('churchId'); }}
                            onBlur={() => onFieldBlur('churchId')}
                            className={clsx(fieldClass(showFieldError('churchId') ? { message: showFieldError('churchId') } : undefined), 'pl-9', shakingField === 'churchId' && 'animate-shake')}
                          >
                            <option value="">{t('auth.churchPlaceholder', 'Choose your church...')}</option>
                            {availableChurches.map((c) => (
                              <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedFieldId && selectedDistrictId && formData.churchId && (
                  <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gradient-to-r from-sda-blue/[0.06] to-sda-blue/[0.03] dark:from-sda-gold/[0.06] dark:to-sda-gold/[0.03] border border-sda-blue/15 dark:border-sda-gold/15 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <span className="w-6 h-6 rounded-full bg-sda-blue text-white flex items-center justify-center shrink-0">
                        <Check size={13} strokeWidth={3} />
                      </span>
                      <span className="leading-relaxed">{fields.find((f) => f.id === selectedFieldId)?.name} <span className="text-slate-300 dark:text-slate-600">&rsaquo;</span> {allDistricts.find((d) => d.id === selectedDistrictId)?.name} <span className="text-slate-300 dark:text-slate-600">&rsaquo;</span> {allChurches.find((c) => c.id === formData.churchId)?.name}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <FormField label="Province" required error={showFieldError('volProvince')}>
                  <select
                    value={volLocation.provinceCode || ''}
                    onChange={(e) => {
                      const code = Number(e.target.value);
                      const province = provinces.find((p: { code: number; name: string }) => p.code === code);
                      setVolLocation({
                        provinceCode: code || null,
                        provinceName: province?.name || null,
                        districtCode: null, districtName: null,
                        sectorCode: null, sectorName: null,
                        cellCode: null, cellName: null,
                        villageCode: null, villageName: null,
                      });
                      touch('volProvince');
                    }}
                    onBlur={() => onFieldBlur('volProvince')}
                    className={clsx(fieldClass(showFieldError('volProvince') ? { message: showFieldError('volProvince') } : undefined), shakingField === 'volProvince' && 'animate-shake')}
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p: { code: number; name: string }) => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </FormField>

                <AnimatePresence>
                  {volLocation.provinceCode && (
                    <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                      <FormField label="District" required error={showFieldError('volDistrict')}>
                        <select
                          value={volLocation.districtCode || ''}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const district = volDistricts.find((d: { code: number; name: string }) => d.code === code);
                            setVolLocation((prev) => ({
                              ...prev,
                              districtCode: code || null,
                              districtName: district?.name || null,
                              sectorCode: null, sectorName: null,
                              cellCode: null, cellName: null,
                              villageCode: null, villageName: null,
                            }));
                            touch('volDistrict');
                          }}
                          onBlur={() => onFieldBlur('volDistrict')}
                          className={clsx(fieldClass(showFieldError('volDistrict') ? { message: showFieldError('volDistrict') } : undefined), shakingField === 'volDistrict' && 'animate-shake')}
                        >
                          <option value="">Select District</option>
                          {volDistricts.map((d: { code: number; name: string }) => (
                            <option key={d.code} value={d.code}>{d.name}</option>
                          ))}
                        </select>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {volLocation.districtCode && (
                    <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                      <FormField label="Sector" required error={showFieldError('volSector')}>
                        <select
                          value={volLocation.sectorCode || ''}
                          onChange={(e) => {
                            const code = e.target.value;
                            const sector = volSectors.find((s: { code: string; name: string }) => s.code === code);
                            setVolLocation((prev) => ({
                              ...prev,
                              sectorCode: code || null,
                              sectorName: sector?.name || null,
                              cellCode: null, cellName: null,
                              villageCode: null, villageName: null,
                            }));
                            touch('volSector');
                          }}
                          onBlur={() => onFieldBlur('volSector')}
                          className={clsx(fieldClass(showFieldError('volSector') ? { message: showFieldError('volSector') } : undefined), shakingField === 'volSector' && 'animate-shake')}
                        >
                          <option value="">Select Sector</option>
                          {volSectors.map((s: { code: string; name: string }) => (
                            <option key={s.code} value={s.code}>{s.name}</option>
                          ))}
                        </select>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {volLocation.sectorCode && (
                    <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                      <FormField label="Cell" required error={showFieldError('volCell')}>
                        <select
                          value={volLocation.cellCode || ''}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const cell = volCells.find((c: { code: number; name: string }) => c.code === code);
                            setVolLocation((prev) => ({
                              ...prev,
                              cellCode: code || null,
                              cellName: cell?.name || null,
                              villageCode: null, villageName: null,
                            }));
                            touch('volCell');
                          }}
                          onBlur={() => onFieldBlur('volCell')}
                          className={clsx(fieldClass(showFieldError('volCell') ? { message: showFieldError('volCell') } : undefined), shakingField === 'volCell' && 'animate-shake')}
                        >
                          <option value="">Select Cell</option>
                          {volCells.map((c: { code: number; name: string }) => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {volLocation.cellCode && (
                    <motion.div {...slideUp} transition={{ duration: 0.3 }}>
                      <FormField label="Village" required error={showFieldError('volVillage')}>
                        <select
                          value={volLocation.villageCode || ''}
                          onChange={(e) => {
                            const code = Number(e.target.value);
                            const village = volVillages.find((v: { code: number; name: string }) => v.code === code);
                            setVolLocation((prev) => ({
                              ...prev,
                              villageCode: code || null,
                              villageName: village?.name || null,
                            }));
                            touch('volVillage');
                          }}
                          onBlur={() => onFieldBlur('volVillage')}
                          className={clsx(fieldClass(showFieldError('volVillage') ? { message: showFieldError('volVillage') } : undefined), shakingField === 'volVillage' && 'animate-shake')}
                        >
                          <option value="">Select Village</option>
                          {volVillages.map((v: { code: number; name: string }) => (
                            <option key={v.code} value={v.code}>{v.name}</option>
                          ))}
                        </select>
                      </FormField>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
          </motion.div>
        )}

        {/* Step 4: Church Affiliation & Ministry */}
        {currentStep === 4 && (
          <motion.div key="step-4" {...slideUp} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="space-y-6" role="group" aria-label="Church Affiliation">
            <SectionHeader
              icon={<Church size={18} />}
              title={t('member.formChurchPlacement', 'Church Affiliation')}
              subtitle={t('member.stepChurchAffiliationSubtitle', 'Your local church and ministry involvement')}
            />

            {accountType === 'volunteer' && (
              <FormField label={t('auth.churchLabel', 'Local Church')} error={showFieldError('churchId')}>
                <div className="relative">
                  <Church className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={16} />
                  <select
                    value={formData.churchId}
                    onChange={(e) => { update('churchId', e.target.value); touch('churchId'); }}
                    onBlur={() => onFieldBlur('churchId')}
                    className={clsx(fieldClass(showFieldError('churchId') ? { message: showFieldError('churchId') } : undefined), 'pl-9', shakingField === 'churchId' && 'animate-shake')}
                  >
                    <option value="">{t('auth.churchPlaceholder', 'Choose your church...')}</option>
                    {allChurches.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </FormField>
            )}

            <FormField label={t('member.formMinistryRoles', 'Ministry Roles')} error={errors.ministryRoles}>
              <p className="text-xs text-slate-400 font-medium mb-3">{t('member.formMinistryRolesHint', 'Select all that apply')}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group">
                {(Object.entries(MINISTRY_ROLE_LABELS) as [MinistryRole, string][]).map(([key, label]) => {
                  const isSelected = formData.ministryRoles.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleMinistryRole(key)}
                      className={clsx(
                        'flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/20',
                        isSelected
                          ? 'bg-sda-blue text-white border-sda-blue shadow-md shadow-sda-blue/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sda-blue/40 hover:text-sda-blue dark:hover:text-sda-gold',
                      )}
                      aria-pressed={isSelected}
                    >
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                          <Check size={10} strokeWidth={3.5} />
                        </span>
                      )}
                      <span className="truncate">{label}</span>
                    </button>
                  );
                })}
              </div>
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={t('member.filterClass', 'Sabbath School Class')}>
                <input
                  value={formData.sabbathClass}
                  onChange={(e) => update('sabbathClass', e.target.value)}
                  placeholder={t('member.formSabbathClassPlaceholder', 'e.g. Young Adults')}
                  className={fieldClass()}
                />
              </FormField>
              <FormField label={t('member.formBaptismDate', 'Baptism Date')}>
                <input
                  type="date"
                  value={formData.baptismDate}
                  onChange={(e) => update('baptismDate', e.target.value)}
                  className={fieldClass()}
                />
              </FormField>
            </div>
          </div>
          </motion.div>
        )}

        {/* Step 5: Credentials & Emergency Contact */}
        {currentStep === 5 && (
          <motion.div key="step-5" {...slideUp} transition={{ duration: 0.35, ease: 'easeOut' }}>
          <div className="space-y-6" role="group" aria-label="Account & Emergency">
            <SectionHeader
              icon={<Lock size={18} />}
              title={t('auth.stepCredentials', 'Account & Emergency Contact')}
              subtitle={t('auth.stepCredentialsSubtitle', 'Set your password and emergency contact')}
            />

            {/* Account Details */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sda-blue/5 text-sda-blue dark:text-sda-gold flex items-center justify-center">
                  <Shield size={13} />
                </span>
                Account Details
              </h4>
              <FormField label={t('auth.email', 'Email Address')} required error={showFieldError('email')}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                  onBlur={() => onFieldBlur('email')}
                  placeholder={t('auth.emailPlaceholder', 'name@example.com')}
                  className={clsx(fieldClass(showFieldError('email') ? { message: showFieldError('email') } : undefined), shakingField === 'email' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label={t('auth.password', 'Password')} required error={showFieldError('password')}>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => update('password', e.target.value)}
                    onBlur={() => onFieldBlur('password')}
                    placeholder={t('auth.passwordPlaceholder', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022')}
                    className={clsx(fieldClass(showFieldError('password') ? { message: showFieldError('password') } : undefined), shakingField === 'password' && 'animate-shake')}
                    aria-required="true"
                  />
                </FormField>

                <FormField label={t('auth.confirmPassword', 'Confirm Password')} required error={showFieldError('confirmPassword')}>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => update('confirmPassword', e.target.value)}
                    onBlur={() => onFieldBlur('confirmPassword')}
                    placeholder={t('auth.passwordPlaceholder', '\u2022\u2022\u2022\u2022\u2022\u2022\u2022')}
                    className={clsx(fieldClass(showFieldError('confirmPassword') ? { message: showFieldError('confirmPassword') } : undefined), shakingField === 'confirmPassword' && 'animate-shake')}
                    aria-required="true"
                  />
                </FormField>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 space-y-4">
              <h4 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sda-blue/5 text-sda-blue dark:text-sda-gold flex items-center justify-center">
                  <Heart size={13} />
                </span>
                {t('member.formEmergencyContact', 'Emergency Contact')}
              </h4>
              <div className="flex items-start gap-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/30 rounded-xl p-3.5">
                <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  {t('member.emergencyContactInfo', 'Provide a next of kin for pastoral care and emergencies.')}
                </p>
              </div>

              <FormField label={t('member.formEmergencyName', 'Contact Full Name')} required error={showFieldError('emergencyName')}>
                <input
                  value={formData.emergencyName}
                  onChange={(e) => update('emergencyName', e.target.value)}
                  onBlur={() => onFieldBlur('emergencyName')}
                  placeholder={t('member.formEmergencyNamePlaceholder', 'e.g. Marie Uwimana')}
                  className={clsx(fieldClass(showFieldError('emergencyName') ? { message: showFieldError('emergencyName') } : undefined), shakingField === 'emergencyName' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>

              <FormField label={t('member.formEmergencyPhone', 'Contact Phone Number')} required error={showFieldError('emergencyPhone')} hint="+250XXXXXXXXX">
                <input
                  value={formData.emergencyPhone}
                  onChange={(e) => update('emergencyPhone', e.target.value)}
                  onBlur={() => onFieldBlur('emergencyPhone')}
                  placeholder="+250788123456"
                  className={clsx(fieldClass(showFieldError('emergencyPhone') ? { message: showFieldError('emergencyPhone') } : undefined), shakingField === 'emergencyPhone' && 'animate-shake')}
                  aria-required="true"
                />
              </FormField>
            </div>
          </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className={clsx(
            'flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/20',
            currentStep === 1
              ? 'opacity-30 cursor-not-allowed text-slate-400'
              : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200',
          )}
        >
          <ArrowLeft size={16} /> {t('common.back', 'Back')}
        </button>

        <div className="flex items-center gap-3">
          {currentStep < STEP_COUNT ? (
            <button
              type="button"
              onClick={handleNext}
              className="group bg-sda-blue hover:bg-sda-blue-dark text-white px-8 py-3 rounded-xl shadow-lg shadow-sda-blue/25 hover:shadow-xl hover:shadow-sda-blue/30 flex items-center gap-2 transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/25 font-bold text-sm"
            >
              {t('member.stepNext', 'Next')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className="group bg-gradient-to-r from-sda-blue to-sda-blue-dark hover:from-sda-blue-dark hover:to-sda-blue text-white px-10 py-3 rounded-xl shadow-xl shadow-sda-blue/25 hover:shadow-2xl hover:shadow-sda-blue/30 flex items-center gap-2.5 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-4 focus-visible:ring-sda-blue/30 font-bold text-sm"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <span className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Check size={14} strokeWidth={3} />
                </span>
              )}
              <span>{t('auth.signUp', 'Sign Up')}</span>
            </button>
          )}
        </div>
      </div>

      <div className="text-center pt-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {t('auth.hasAccount', 'Already have an account?')}{' '}
          <Link to={ROUTES.LOGIN} className="text-sda-blue hover:text-sda-blue-dark dark:hover:text-sda-gold hover:underline font-bold transition-colors">
            {t('auth.signIn', 'Sign In')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
