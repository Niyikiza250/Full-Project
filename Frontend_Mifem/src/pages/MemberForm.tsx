import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useMember, useMembers, useCreateMember, useUpdateMember } from '@/services/memberService';
import {
  ArrowLeft, ArrowRight, Save, Loader2, User, Church, MapPin,
  Shield, Clock, Check, Heart, HelpCircle, Camera, Upload, X, AlertCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useRwandaLocation } from '@/hooks/useRwandaLocation';
import { SectionHeader, FormField } from '@/components/forms/FormField';
import { fieldClass } from '@/lib/fieldStyles';
import {
  AgeGroup,
  calculateAgeGroup,
  AGE_GROUP_LABELS,
  MinistryRole,
  MINISTRY_ROLE_LABELS,
} from '@/types/member';

const STEP_COUNT = 4;

const memberFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t('member.validation.firstNameRequired')).max(50),
  lastName: z.string().min(2, t('member.validation.lastNameRequired')).max(50),
  email: z.string().email(t('member.validation.emailInvalid')).optional().or(z.literal('')),
  phone: z.string().min(10, t('member.validation.phoneInvalid')).regex(/^\+?250\d{9}$/, t('member.validation.phoneFormat')),
  whatsapp: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE'], { message: t('member.validation.genderRequired') }),
  dateOfBirth: z.string().optional().or(z.literal('')),
  ageGroup: z.enum(['YOUTH', 'YOUNG_ADULT', 'ADULT', 'SENIOR']).optional(),
  churchId: z.string().min(1, t('member.validation.churchRequired')),
  ministryRoles: z.array(z.string()).optional(),
  address: z.string().optional(),
  village: z.string().optional(),
  sector: z.string().optional(),
  district: z.string().optional(),
  provinceCode: z.coerce.number().optional(),
  provinceName: z.string().optional(),
  districtCode: z.coerce.number().optional(),
  districtName: z.string().optional(),
  sectorCode: z.string().optional(),
  sectorName: z.string().optional(),
  cellCode: z.coerce.number().optional(),
  cellName: z.string().optional(),
  villageCode: z.coerce.number().optional(),
  villageName: z.string().optional(),
  emergencyName: z.string().min(2, t('member.validation.emergencyNameRequired')).max(100),
  emergencyPhone: z.string().min(10, t('member.validation.emergencyPhoneRequired')).regex(/^\+?250\d{9}$/, t('member.validation.phoneFormat')),
  sabbathClass: z.string().optional(),
  role: z.string().min(1),
  status: z.string().min(1),
  registrationType: z.enum(['MEMBER', 'VOLUNTEER']).default('MEMBER'),
  imageUrl: z.string().optional(),
  baptismDate: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.registrationType === 'VOLUNTEER') {
    if (!data.provinceCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Province is required', path: ['provinceCode'] });
    if (!data.districtCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'District is required', path: ['districtCode'] });
    if (!data.sectorCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sector is required', path: ['sectorCode'] });
    if (!data.cellCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cell is required', path: ['cellCode'] });
    if (!data.villageCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Village is required', path: ['villageCode'] });
  }
});

type MemberFormValues = z.infer<ReturnType<typeof memberFormSchema>>;

interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  fields: (keyof MemberFormValues)[];
}

const MemberForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const rwandaLocation = useRwandaLocation();
  const isEdit = !!id;
  const needsApproval = user?.role === 'MINISTRY_LEADER';

  const { data: member, isLoading: isMemberLoading } = useMember(id || '');
  const { data: churchesData } = useMembers({ limit: 500 });
  const churches = useMemo(() => (churchesData?.data ?? []) as Array<{ id: string; churchName: string }>, [churchesData]);

  const [currentStep, setCurrentStep] = useState(1);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoSaved, setAutoSaved] = useState(false);

  const schema = useMemo(() => memberFormSchema(t), [t]);

  const { register, handleSubmit, watch, setValue, control, trigger, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      registrationType: 'MEMBER',
      role: 'MEMBER',
      status: 'ACTIVE',
      ministryRoles: [],
    },
    values: member ? {
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      whatsapp: member.whatsapp ?? '',
      gender: member.gender,
      dateOfBirth: member.dateOfBirth ?? '',
      ageGroup: member.ageGroup,
      churchId: member.churchName ?? '',
      ministryRoles: member.ministryRoles ?? [],
      address: member.address ?? '',
      village: member.village ?? '',
      sector: member.sector ?? '',
      district: member.district ?? '',
      emergencyName: member.emergencyContact?.name ?? '',
      emergencyPhone: member.emergencyContact?.phone ?? '',
      sabbathClass: member.sabbathClass ?? '',
      role: member.role,
      status: member.status,
      registrationType: 'MEMBER',
      imageUrl: member.imageUrl ?? '',
      baptismDate: member.baptismDate ?? '',
    } : undefined,
  });

  const provinceCode = watch('provinceCode');
  const districtCode = watch('districtCode');
  const sectorCode = watch('sectorCode');
  const cellCode = watch('cellCode');
  const registrationType = watch('registrationType');
  const dateOfBirth = watch('dateOfBirth');
  const watchedMinistryRoles = watch('ministryRoles');

  const provinces = rwandaLocation?.getProvinces() || [];
  const districts = rwandaLocation && provinceCode ? rwandaLocation.getDistricts(provinceCode) || [] : [];
  const sectors = rwandaLocation && districtCode ? rwandaLocation.getSectors(districtCode) || [] : [];
  const cells = rwandaLocation && sectorCode ? rwandaLocation.getCells(sectorCode) || [] : [];
  const villages = rwandaLocation && cellCode ? rwandaLocation.getVillages(cellCode) || [] : [];

  const autoAgeGroup = useMemo(() => {
    if (dateOfBirth) return calculateAgeGroup(dateOfBirth);
    return null;
  }, [dateOfBirth]);

  useEffect(() => {
    if (autoAgeGroup) {
      setValue('ageGroup', autoAgeGroup, { shouldValidate: true });
    }
  }, [autoAgeGroup, setValue]);

  const steps: StepConfig[] = useMemo(() => [
    {
      title: t('member.stepPersonal'),
      subtitle: t('member.stepPersonalSubtitle'),
      icon: <User size={18} />,
      fields: ['firstName', 'lastName', 'email', 'phone', 'whatsapp', 'gender', 'dateOfBirth', 'ageGroup'],
    },
    {
      title: t('member.stepContactLocation'),
      subtitle: t('member.stepContactLocationSubtitle'),
      icon: <MapPin size={18} />,
      fields: registrationType === 'VOLUNTEER'
        ? ['provinceCode', 'districtCode', 'sectorCode', 'cellCode', 'villageCode']
        : ['address', 'village', 'sector', 'district'],
    },
    {
      title: t('member.stepChurchAffiliation'),
      subtitle: t('member.stepChurchAffiliationSubtitle'),
      icon: <Church size={18} />,
      fields: ['churchId', 'ministryRoles', 'sabbathClass'],
    },
    {
      title: t('member.stepEmergencyContact'),
      subtitle: t('member.stepEmergencyContactSubtitle'),
      icon: <Heart size={18} />,
      fields: ['emergencyName', 'emergencyPhone'],
    },
  ], [t, registrationType]);

  const getStepFields = useCallback((step: number): (keyof MemberFormValues)[] => {
    return steps[step - 1]?.fields ?? [];
  }, [steps]);

  const validateStep = useCallback(async (step: number): Promise<boolean> => {
    const fields = getStepFields(step);
    const result = await trigger(fields as never);
    return result;
  }, [trigger, getStepFields]);

  const handleNext = useCallback(async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEP_COUNT) {
      setCurrentStep((prev) => prev + 1);
    }
  }, [currentStep, validateStep]);

  const handlePrev = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  useEffect(() => {
    const currentValues = watch();
    const draftKey = `member-form-draft-${user?.id ?? 'new'}`;
    const draft = JSON.stringify(currentValues);
    try {
      localStorage.setItem(draftKey, draft);
      setAutoSaved(true);
      const timeout = setTimeout(() => setAutoSaved(false), 2000);
      return () => clearTimeout(timeout);
    } catch {
      // localStorage full or unavailable
    }
  }, [watch, currentStep, user?.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setValue('imageUrl', dataUrl, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMinistryRole = useCallback((role: MinistryRole) => {
    const current = watchedMinistryRoles ?? [];
    const updated = current.includes(role)
      ? current.filter((r) => r !== role)
      : [...current, role];
    setValue('ministryRoles', updated, { shouldValidate: true });
  }, [watchedMinistryRoles, setValue]);

  const createMemberMutation = useCreateMember();
  const updateMemberMutation = useUpdateMember();

  const onSubmit = async (data: MemberFormValues) => {
    const payload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email || undefined,
      phone: data.phone,
      whatsapp: data.whatsapp || undefined,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth || undefined,
      ageGroup: data.ageGroup || undefined,
      churchId: data.churchId,
      sabbathClass: data.sabbathClass || undefined,
      role: data.role,
      status: data.status,
      registrationType: data.registrationType,
      address: data.address || undefined,
      village: data.village || undefined,
      sector: data.sector || undefined,
      district: data.district || undefined,
      emergencyName: data.emergencyName,
      emergencyPhone: data.emergencyPhone,
      baptismDate: data.baptismDate || undefined,
      ministryRoles: data.ministryRoles || [],
      provinceCode: data.provinceCode,
      provinceName: data.provinceName,
      districtCode: data.districtCode,
      districtName: data.districtName,
      sectorCode: data.sectorCode,
      sectorName: data.sectorName,
      cellCode: data.cellCode,
      cellName: data.cellName,
      villageCode: data.villageCode,
      villageName: data.villageName,
    };

    if (needsApproval) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate(ROUTES.MEMBERS);
      return;
    }

    try {
      if (isEdit && id) {
        await updateMemberMutation.mutateAsync({ id, ...payload });
      } else {
        await createMemberMutation.mutateAsync(payload);
      }
      const draftKey = `member-form-draft-${user?.id ?? 'new'}`;
      localStorage.removeItem(draftKey);
      navigate(ROUTES.MEMBERS);
    } catch {
      // Error handled by mutation
    }
  };

  if (isEdit && isMemberLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sda-blue" size={48} />
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'CHURCH_LEADER' && user?.role !== 'MINISTRY_LEADER' && user?.role !== 'FIELD_ADMINISTRATOR') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  const progressPercent = Math.round((currentStep / STEP_COUNT) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-sda-blue flex items-center transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> {t('member.formBack')}
        </button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {isEdit ? t('member.formUpdate') : t('member.formRegister')}
        </h1>
      </div>

      {/* Registration Type Toggle */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setValue('registrationType', 'MEMBER')}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all',
            registrationType === 'MEMBER'
              ? 'bg-white dark:bg-slate-700 text-sda-blue shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {t('member.registerAsMember')}
        </button>
        <button
          type="button"
          onClick={() => setValue('registrationType', 'VOLUNTEER')}
          className={clsx(
            'px-6 py-2 rounded-lg text-sm font-bold transition-all',
            registrationType === 'VOLUNTEER'
              ? 'bg-white dark:bg-slate-700 text-sda-blue shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {t('member.registerAsVolunteer')}
        </button>
      </div>

      {/* Step Progress Indicator */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              {t('member.stepProgress', { step: currentStep, total: STEP_COUNT })}
            </span>
            <span className="text-xs font-bold text-sda-blue">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sda-blue to-sda-blue-dark rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;
            return (
              <button
                key={step.title}
                type="button"
                onClick={() => {
                  if (stepNum < currentStep) setCurrentStep(stepNum);
                }}
                className={clsx(
                  'flex items-center gap-3 transition-all',
                  stepNum < currentStep ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all',
                  isCompleted && 'bg-green-500 text-white',
                  isCurrent && 'bg-sda-blue text-white shadow-lg shadow-sda-blue/30',
                  !isCompleted && !isCurrent && 'bg-slate-100 dark:bg-slate-800 text-slate-400',
                )}>
                  {isCompleted ? <Check size={16} /> : stepNum}
                </div>
                <div className="hidden md:block text-left">
                  <p className={clsx(
                    'text-xs font-bold',
                    isCurrent ? 'text-sda-blue' : isCompleted ? 'text-green-600' : 'text-slate-400',
                  )}>
                    {step.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{step.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Auto-save indicator */}
      {autoSaved && (
        <div className="flex items-center gap-2 text-[10px] text-green-600 font-bold" role="status" aria-live="polite">
          <Check size={12} /> {t('member.autoSaved')}
        </div>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-8" role="group" aria-label={t('member.stepPersonal')}>
              <SectionHeader
                icon={<User size={18} />}
                title={t('member.formPersonalInfo')}
                subtitle={t('member.formPersonalInfoSubtitle')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label={t('member.formFirstName')} required error={errors.firstName?.message}>
                  <input
                    {...register('firstName')}
                    placeholder={t('member.formFirstNamePlaceholder')}
                    className={fieldClass(errors.firstName)}
                    aria-required="true"
                  />
                </FormField>

                <FormField label={t('member.formLastName')} required error={errors.lastName?.message}>
                  <input
                    {...register('lastName')}
                    placeholder={t('member.formLastNamePlaceholder')}
                    className={fieldClass(errors.lastName)}
                    aria-required="true"
                  />
                </FormField>

                <FormField label={t('member.formEmail')} error={errors.email?.message} hint={t('member.formEmailHint')}>
                  <input
                    {...register('email')}
                    type="email"
                    placeholder={t('member.formEmailPlaceholder')}
                    className={fieldClass(errors.email)}
                  />
                </FormField>

                <FormField label={t('member.formPhone')} required error={errors.phone?.message} hint="+250XXXXXXXXX">
                  <input
                    {...register('phone')}
                    placeholder="+250788123456"
                    className={fieldClass(errors.phone)}
                    aria-required="true"
                  />
                </FormField>

                <FormField label={t('member.formWhatsApp')} error={errors.whatsapp?.message} hint={t('member.formWhatsAppHint')}>
                  <input
                    {...register('whatsapp')}
                    placeholder="+250788123456"
                    className={fieldClass(errors.whatsapp)}
                  />
                </FormField>

                <FormField label={t('member.formGender')} required error={errors.gender?.message}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-4" role="radiogroup" aria-label={t('member.formGender')}>
                        {(['MALE', 'FEMALE'] as const).map((g) => (
                          <label key={g} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value={g}
                              checked={field.value === g}
                              onChange={() => field.onChange(g)}
                              className="text-sda-blue focus:ring-sda-blue"
                            />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {g === 'MALE' ? t('member.formMale') : t('member.formFemale')}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                </FormField>

                <FormField label={t('member.formDateOfBirth')} error={errors.dateOfBirth?.message}>
                  <input
                    {...register('dateOfBirth')}
                    type="date"
                    className={fieldClass(errors.dateOfBirth)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </FormField>

                <FormField label={t('member.formAgeGroup')} hint={autoAgeGroup ? t('member.ageGroupAuto') : ''}>
                  <select {...register('ageGroup')} className={fieldClass(errors.ageGroup)}>
                    <option value="">{t('member.selectAgeGroup')}</option>
                    {(Object.entries(AGE_GROUP_LABELS) as [AgeGroup, string][]).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                  {autoAgeGroup && (
                    <p className="mt-1 text-[10px] text-green-600 font-bold flex items-center gap-1">
                      <Check size={10} /> {t('member.autoCalculated', { group: AGE_GROUP_LABELS[autoAgeGroup] })}
                    </p>
                  )}
                </FormField>
              </div>

              {/* Profile Photo */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <FormField label={t('member.formPhoto')} error={undefined}>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group">
                        {imagePreview || member?.imageUrl ? (
                          <img src={imagePreview || member?.imageUrl} alt={t('member.formPhotoPreview')} className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={28} className="text-slate-300" />
                        )}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-2xl">
                          <Upload size={20} className="text-white" />
                          <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                        </label>
                      </div>
                      {imagePreview && (
                        <button
                          type="button"
                          onClick={() => setImagePreview(null)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium">{t('member.formPhotoHint')}</p>
                  </div>
                </FormField>
              </div>
            </div>
          )}

          {/* Step 2: Contact & Location */}
          {currentStep === 2 && (
            <div className="space-y-8" role="group" aria-label={t('member.stepContactLocation')}>
              <SectionHeader
                icon={<MapPin size={18} />}
                title={registrationType === 'VOLUNTEER' ? t('member.formLocationVolunteer') : t('member.formAddress')}
                subtitle={t('member.stepContactLocationSubtitle')}
              />

              {registrationType === 'VOLUNTEER' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label="Province" required error={errors.provinceCode?.message}>
                    <select
                      value={provinceCode || ''}
                      onChange={(e) => {
                        const code = Number(e.target.value);
                        const name = provinces.find((p: { code: number; name: string }) => p.code === code)?.name || '';
                        setValue('provinceCode', code, { shouldValidate: true });
                        setValue('provinceName', name);
                        setValue('districtCode', 0);
                        setValue('districtName', '');
                        setValue('sectorCode', '');
                        setValue('sectorName', '');
                        setValue('cellCode', 0);
                        setValue('cellName', '');
                        setValue('villageCode', 0);
                        setValue('villageName', '');
                      }}
                      className={fieldClass(errors.provinceCode)}
                      aria-required="true"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p: { code: number; name: string }) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="District" required error={errors.districtCode?.message}>
                    <select
                      disabled={!provinceCode}
                      value={districtCode || ''}
                      onChange={(e) => {
                        const code = Number(e.target.value);
                        const name = districts.find((d: { code: number; name: string }) => d.code === code)?.name || '';
                        setValue('districtCode', code, { shouldValidate: true });
                        setValue('districtName', name);
                        setValue('sectorCode', '');
                        setValue('sectorName', '');
                        setValue('cellCode', 0);
                        setValue('cellName', '');
                        setValue('villageCode', 0);
                        setValue('villageName', '');
                      }}
                      className={fieldClass(errors.districtCode)}
                      aria-required="true"
                    >
                      <option value="">Select District</option>
                      {districts.map((d: { code: number; name: string }) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Sector" required error={errors.sectorCode?.message}>
                    <select
                      disabled={!districtCode}
                      value={sectorCode || ''}
                      onChange={(e) => {
                        const code = e.target.value;
                        const name = sectors.find((s: { code: string; name: string }) => s.code === code)?.name || '';
                        setValue('sectorCode', code, { shouldValidate: true });
                        setValue('sectorName', name);
                        setValue('cellCode', 0);
                        setValue('cellName', '');
                        setValue('villageCode', 0);
                        setValue('villageName', '');
                      }}
                      className={fieldClass(errors.sectorCode)}
                      aria-required="true"
                    >
                      <option value="">Select Sector</option>
                      {sectors.map((s: { code: string; name: string }) => (
                        <option key={s.code} value={s.code}>{s.name}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Cell" required error={errors.cellCode?.message}>
                    <select
                      disabled={!sectorCode}
                      value={watch('cellCode') || ''}
                      onChange={(e) => {
                        const code = Number(e.target.value);
                        const name = cells.find((c: { code: number; name: string }) => c.code === code)?.name || '';
                        setValue('cellCode', code, { shouldValidate: true });
                        setValue('cellName', name);
                        setValue('villageCode', 0);
                        setValue('villageName', '');
                      }}
                      className={fieldClass(errors.cellCode)}
                      aria-required="true"
                    >
                      <option value="">Select Cell</option>
                      {cells.map((c: { code: number; name: string }) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="Village" required error={errors.villageCode?.message}>
                    <select
                      disabled={!cellCode}
                      value={watch('villageCode') || ''}
                      onChange={(e) => {
                        const code = Number(e.target.value);
                        const name = villages.find((v: { code: number; name: string }) => v.code === code)?.name || '';
                        setValue('villageCode', code, { shouldValidate: true });
                        setValue('villageName', name);
                      }}
                      className={fieldClass(errors.villageCode)}
                      aria-required="true"
                    >
                      <option value="">Select Village</option>
                      {villages.map((v: { code: number; name: string }) => (
                        <option key={v.code} value={v.code}>{v.name}</option>
                      ))}
                    </select>
                  </FormField>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label={t('member.formAddress')} error={errors.address?.message} className="md:col-span-2">
                    <input
                      {...register('address')}
                      placeholder={t('member.formAddressPlaceholder')}
                      className={fieldClass(errors.address)}
                    />
                  </FormField>
                  <FormField label={t('member.formVillage')} error={errors.village?.message}>
                    <input
                      {...register('village')}
                      placeholder={t('member.formVillagePlaceholder')}
                      className={fieldClass(errors.village)}
                    />
                  </FormField>
                  <FormField label={t('member.formSector')} error={errors.sector?.message}>
                    <input
                      {...register('sector')}
                      placeholder={t('member.formSectorPlaceholder')}
                      className={fieldClass(errors.sector)}
                    />
                  </FormField>
                  <FormField label={t('member.formDistrict')} error={errors.district?.message}>
                    <input
                      {...register('district')}
                      placeholder={t('member.formDistrictPlaceholder')}
                      className={fieldClass(errors.district)}
                    />
                  </FormField>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Church Affiliation */}
          {currentStep === 3 && (
            <div className="space-y-8" role="group" aria-label={t('member.stepChurchAffiliation')}>
              <SectionHeader
                icon={<Church size={18} />}
                title={t('member.formChurchPlacement')}
                subtitle={t('member.stepChurchAffiliationSubtitle')}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label={t('member.formLocalChurch')} required error={errors.churchId?.message}>
                  <select {...register('churchId')} className={fieldClass(errors.churchId)} aria-required="true">
                    <option value="">{t('member.formSelectChurch')}</option>
                    {churches.map((c) => (
                      <option key={c.id} value={c.id}>{c.churchName}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label={t('member.filterClass')} error={errors.sabbathClass?.message}>
                  <input
                    {...register('sabbathClass')}
                    placeholder={t('member.formSabbathClassPlaceholder')}
                    className={fieldClass(errors.sabbathClass)}
                  />
                </FormField>
              </div>

              {/* Ministry Roles - Multi-select */}
              <FormField label={t('member.formMinistryRoles')} error={errors.ministryRoles?.message as string | undefined}>
                <p className="text-[10px] text-slate-400 font-medium mb-3">{t('member.formMinistryRolesHint')}</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2" role="group" aria-label={t('member.formMinistryRoles')}>
                  {(Object.entries(MINISTRY_ROLE_LABELS) as [MinistryRole, string][]).map(([key, label]) => {
                    const isSelected = (watchedMinistryRoles ?? []).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleMinistryRole(key)}
                        className={clsx(
                          'px-3 py-2.5 rounded-xl text-xs font-bold border transition-all text-left',
                          isSelected
                            ? 'bg-sda-blue/10 border-sda-blue text-sda-blue'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300',
                        )}
                        aria-pressed={isSelected}
                      >
                        {isSelected && <Check size={12} className="inline mr-1" />}
                        {label}
                      </button>
                    );
                  })}
                </div>
              </FormField>

              {/* Governance & Status */}
              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield size={16} className="text-sda-blue" />
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('member.formGovernance')}</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormField label={t('member.formMemberRole')}>
                    <select {...register('role')} className={fieldClass(errors.role)}>
                      <option value="MEMBER">{t('member.roleChurchMember')}</option>
                      <option value="CHURCH_LEADER">{t('member.roleChurchLeader')}</option>
                      <option value="FIELD_LEADER">{t('member.roleFieldLeader')}</option>
                      <option value="UNION_LEADER">{t('member.roleUnionLeader')}</option>
                    </select>
                  </FormField>
                  <FormField label={t('common.status')}>
                    <select {...register('status')} className={fieldClass(errors.status)}>
                      <option value="ACTIVE">{t('member.statusActive')}</option>
                      <option value="INACTIVE">{t('member.statusInactive')}</option>
                      <option value="TRANSFERRED">{t('member.statusTransferred')}</option>
                    </select>
                  </FormField>
                  <FormField label={t('member.formBaptismDate')}>
                    <input type="date" {...register('baptismDate')} className={fieldClass(errors.baptismDate)} />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Emergency Contact */}
          {currentStep === 4 && (
            <div className="space-y-8" role="group" aria-label={t('member.stepEmergencyContact')}>
              <SectionHeader
                icon={<Heart size={18} />}
                title={t('member.formEmergencyContact')}
                subtitle={t('member.stepEmergencyContactSubtitle')}
              />

              <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  {t('member.emergencyContactInfo')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label={t('member.formEmergencyName')} required error={errors.emergencyName?.message}>
                  <input
                    {...register('emergencyName')}
                    placeholder={t('member.formEmergencyNamePlaceholder')}
                    className={fieldClass(errors.emergencyName)}
                    aria-required="true"
                  />
                </FormField>

                <FormField label={t('member.formEmergencyPhone')} required error={errors.emergencyPhone?.message} hint="+250XXXXXXXXX">
                  <input
                    {...register('emergencyPhone')}
                    placeholder="+250788123456"
                    className={fieldClass(errors.emergencyPhone)}
                    aria-required="true"
                  />
                </FormField>
              </div>

              {/* Help Tooltip */}
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <HelpCircle size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  {t('member.emergencyContactHelpText')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={clsx(
              'flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all',
              currentStep === 1
                ? 'opacity-30 cursor-not-allowed text-slate-400'
                : 'text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800',
            )}
          >
            <ArrowLeft size={16} /> {t('common.cancel')}
          </button>

          <div className="flex items-center gap-3">
            {currentStep < STEP_COUNT ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-sda-blue hover:bg-sda-blue-dark text-white px-8 py-3 rounded-xl shadow-lg shadow-sda-blue/20 flex items-center gap-2 transition-all transform active:scale-95 font-bold text-sm"
              >
                {t('member.stepNext')} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-sda-blue hover:bg-sda-blue-dark text-white px-10 py-3.5 rounded-2xl shadow-xl shadow-sda-blue/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50 font-bold"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : needsApproval ? (
                  <Clock size={20} />
                ) : (
                  <Save size={20} />
                )}
                <span>
                  {needsApproval
                    ? t('member.formSubmitForApproval')
                    : isEdit
                      ? t('member.formSubmitUpdate')
                      : t('member.formSubmitRegister')}
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default MemberForm;
