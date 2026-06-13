import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useMember } from '@/services/memberService';
import { 
  ArrowLeft, Save, Loader2, User, Church, MapPin, 
  Camera, Upload, X, Shield, Clock 
} from 'lucide-react';
import { clsx } from 'clsx';
import { rwandaLocation } from '@devrw/rwanda-location';

const memberSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(2, t('member.validation.firstNameRequired')),
  lastName: z.string().min(2, t('member.validation.lastNameRequired')),
  email: z.string().email(t('member.validation.emailInvalid')),
  phone: z.string().min(10, t('member.validation.phoneInvalid')),
  gender: z.enum(['MALE', 'FEMALE']),
  dateOfBirth: z.string().min(1, t('member.validation.dateOfBirthRequired')),
  baptismDate: z.string().optional(),
  role: z.string().min(1, t('member.validation.roleRequired')),
  status: z.string().min(1, t('member.validation.statusRequired')),
  sabbathClass: z.string().optional(),
  address: z.string().optional(),
  imageUrl: z.string().optional(),
  registrationType: z.enum(['MEMBER', 'VOLUNTEER']).default('VOLUNTEER'),
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
}).superRefine((data, ctx) => {
  if (data.registrationType === 'VOLUNTEER') {
    if (!data.provinceCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Province is required', path: ['provinceCode'] });
    if (!data.districtCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'District is required', path: ['districtCode'] });
    if (!data.sectorCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Sector is required', path: ['sectorCode'] });
    if (!data.cellCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Cell is required', path: ['cellCode'] });
    if (!data.villageCode) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Village is required', path: ['villageCode'] });
  } else {
    if (!data.address) ctx.addIssue({ code: z.ZodIssueCode.custom, message: t('member.validation.addressRequired') || 'Address is required', path: ['address'] });
  }
});

type MemberFormValues = z.infer<ReturnType<typeof memberSchema>>;

const MemberForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const needsApproval = user?.role === 'MINISTRY_LEADER';

  const { data: member, isLoading: isMemberLoading } = useMember(id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const schema = useMemo(() => memberSchema(t), [t]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
    resolver: zodResolver(schema),
    values: member ? {
      ...member,
      baptismDate: member.baptismDate || '',
    } : undefined,
  });

  const provinceCode = watch('provinceCode');
  const districtCode = watch('districtCode');
  const sectorCode = watch('sectorCode');
  const cellCode = watch('cellCode');
  const registrationType = watch('registrationType');

  const provinces = rwandaLocation.getProvinces() || [];
  const districts = provinceCode ? rwandaLocation.getDistricts(provinceCode) || [] : [];
  const sectors = districtCode ? rwandaLocation.getSectors(districtCode) || [] : [];
  const cells = sectorCode ? rwandaLocation.getCells(sectorCode) || [] : [];
  const villages = cellCode ? rwandaLocation.getVillages(cellCode) || [] : [];

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

  const onSubmit = async (data: MemberFormValues) => {
    if (needsApproval) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate(ROUTES.MEMBERS);
      return;
    }
    console.log('Saving member:', data);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate(ROUTES.MEMBERS);
  };

  if (isEdit && isMemberLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sda-blue" size={48} />
      </div>
    );
  }

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'CHURCH_LEADER' && user?.role !== 'MINISTRY_LEADER') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
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

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setValue('registrationType', 'MEMBER')}
          className={clsx(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            registrationType === 'MEMBER' 
              ? "bg-white dark:bg-slate-700 text-sda-blue shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          Register as Member
        </button>
        <button
          type="button"
          onClick={() => setValue('registrationType', 'VOLUNTEER')}
          className={clsx(
            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
            registrationType === 'VOLUNTEER' 
              ? "bg-white dark:bg-slate-700 text-sda-blue shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          Register as Volunteer
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image & Status */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 text-center">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('member.formPhoto')}</h3>
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden group">
                {imagePreview || member?.imageUrl ? (
                  <img src={imagePreview || member?.imageUrl} alt={t('member.formPhotoPreview')} className="w-full h-full object-cover" />
                ) : (
                  <Camera size={32} className="text-slate-300" />
                )}
                <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Upload size={24} className="text-white" />
                  <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  <input type="hidden" {...register('imageUrl')} />
                </label>
              </div>
              {imagePreview && (
                <button 
                  onClick={() => setImagePreview(null)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <p className="mt-4 text-[10px] text-slate-400 font-medium px-4">
              {t('member.formPhotoHint')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('member.formGovernance')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('member.formMemberRole')}</label>
                <select {...register('role')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue text-sm font-medium">
                  <option value="MEMBER">{t('member.roleChurchMember')}</option>
                  <option value="CHURCH_LEADER">{t('member.roleChurchLeader')}</option>
                  <option value="FIELD_LEADER">{t('member.roleFieldLeader')}</option>
                  <option value="UNION_LEADER">{t('member.roleUnionLeader')}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('common.status')}</label>
                <select {...register('status')} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue text-sm font-medium">
                  <option value="ACTIVE">{t('member.statusActive')}</option>
                  <option value="INACTIVE">{t('member.statusInactive')}</option>
                  <option value="TRANSFERRED">{t('member.statusTransferred')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Form Fields */}
        <div className="lg:col-span-2 space-y-6">
          <Section title={t('member.formPersonalInfo')} icon={<User size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label={t('member.formFirstName')} {...register('firstName')} error={errors.firstName?.message} placeholder={t('member.formFirstNamePlaceholder')} />
              <InputField label={t('member.formLastName')} {...register('lastName')} error={errors.lastName?.message} placeholder={t('member.formLastNamePlaceholder')} />
              <InputField label={t('member.formEmail')} type="email" {...register('email')} error={errors.email?.message} placeholder={t('member.formEmailPlaceholder')} />
              <InputField label={t('member.formPhone')} {...register('phone')} error={errors.phone?.message} placeholder={t('member.formPhonePlaceholder')} />
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{t('member.formGender')}</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="MALE" {...register('gender')} className="text-sda-blue focus:ring-sda-blue" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('member.formMale')}</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" value="FEMALE" {...register('gender')} className="text-sda-blue focus:ring-sda-blue" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('member.formFemale')}</span>
                  </label>
                </div>
              </div>
              <InputField label={t('member.formDateOfBirth')} type="date" {...register('dateOfBirth')} error={errors.dateOfBirth?.message} />
            </div>
          </Section>

          <Section title={t('member.formChurchPlacement')} icon={<Church size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label={t('member.formLocalChurch')} {...register('churchName')} error={errors.churchName?.message} />
              <InputField label={t('member.formZone')} {...register('zoneName')} error={errors.zoneName?.message} />
              <InputField label={t('member.formField')} {...register('fieldName')} error={errors.fieldName?.message} />
              <InputField label={t('member.filterClass')} {...register('sabbathClass')} />
              {registrationType === 'MEMBER' && (
                <InputField label={t('member.formResidence')} {...register('address')} error={errors.address?.message} />
              )}
            </div>
          </Section>

          {registrationType === 'VOLUNTEER' && (
            <Section title="Location Information" icon={<MapPin size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Province *</label>
                <select 
                  className={clsx("w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium", errors.provinceCode ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue")}
                  value={provinceCode || ''}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = provinces.find((p: any) => p.code === code)?.name || '';
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
                >
                  <option value="">Select Province</option>
                  {provinces.map((p: any) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                {errors.provinceCode && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.provinceCode.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">District *</label>
                <select 
                  disabled={!provinceCode}
                  className={clsx("w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium", errors.districtCode ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue")}
                  value={districtCode || ''}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = districts.find((d: any) => d.code === code)?.name || '';
                    setValue('districtCode', code, { shouldValidate: true });
                    setValue('districtName', name);
                    setValue('sectorCode', '');
                    setValue('sectorName', '');
                    setValue('cellCode', 0);
                    setValue('cellName', '');
                    setValue('villageCode', 0);
                    setValue('villageName', '');
                  }}
                >
                  <option value="">Select District</option>
                  {districts.map((d: any) => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
                {errors.districtCode && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.districtCode.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Sector *</label>
                <select 
                  disabled={!districtCode}
                  className={clsx("w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium", errors.sectorCode ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue")}
                  value={sectorCode || ''}
                  onChange={(e) => {
                    const code = e.target.value;
                    const name = sectors.find((s: any) => s.code === code)?.name || '';
                    setValue('sectorCode', code, { shouldValidate: true });
                    setValue('sectorName', name);
                    setValue('cellCode', 0);
                    setValue('cellName', '');
                    setValue('villageCode', 0);
                    setValue('villageName', '');
                  }}
                >
                  <option value="">Select Sector</option>
                  {sectors.map((s: any) => <option key={s.code} value={s.code}>{s.name}</option>)}
                </select>
                {errors.sectorCode && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.sectorCode.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Cell *</label>
                <select 
                  disabled={!sectorCode}
                  className={clsx("w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium", errors.cellCode ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue")}
                  value={cellCode || ''}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = cells.find((c: any) => c.code === code)?.name || '';
                    setValue('cellCode', code, { shouldValidate: true });
                    setValue('cellName', name);
                    setValue('villageCode', 0);
                    setValue('villageName', '');
                  }}
                >
                  <option value="">Select Cell</option>
                  {cells.map((c: any) => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
                {errors.cellCode && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.cellCode.message}</p>}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Village *</label>
                <select 
                  disabled={!cellCode}
                  className={clsx("w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium", errors.villageCode ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue")}
                  value={villageCode || ''}
                  onChange={(e) => {
                    const code = Number(e.target.value);
                    const name = villages.find((v: any) => v.code === code)?.name || '';
                    setValue('villageCode', code, { shouldValidate: true });
                    setValue('villageName', name);
                  }}
                >
                  <option value="">Select Village</option>
                  {villages.map((v: any) => <option key={v.code} value={v.code}>{v.name}</option>)}
                </select>
                {errors.villageCode && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{errors.villageCode.message}</p>}
              </div>
            </div>
          </Section>
          )}

          <Section title={t('member.formSpiritual')} icon={<Shield size={18} />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputField label={t('member.formBaptismDate')} type="date" {...register('baptismDate')} />
              <div className="flex items-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <Shield className="text-green-500 mr-3" size={20} />
                <p className="text-xs text-slate-500 font-medium">{t('member.formVerifiedMember')}</p>
              </div>
            </div>
          </Section>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-sda-blue hover:bg-sda-blue-dark text-white px-10 py-3.5 rounded-2xl shadow-xl shadow-sda-blue/20 flex items-center space-x-2 transition-all transform active:scale-95 disabled:opacity-50 font-bold"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : needsApproval ? <Clock size={20} /> : <Save size={20} />}
              <span>{needsApproval ? (isEdit ? t('member.formSubmitForApproval') : t('member.formSubmitForApproval')) : (isEdit ? t('member.formSubmitUpdate') : t('member.formSubmitRegister'))}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
    <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
      <div className="p-2 bg-sda-blue/5 text-sda-blue rounded-lg">{icon}</div>
      <h3 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const InputField = React.forwardRef<HTMLInputElement, { label: string, error?: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, ...props }, ref) => (
    <div>
      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">{label}</label>
      <input
        ref={ref}
        {...props}
        className={clsx(
          "w-full px-4 py-2.5 rounded-lg border outline-none focus:ring-2 transition-all text-sm font-medium",
          error 
            ? "border-red-200 bg-red-50 dark:bg-red-900/10 focus:ring-red-500" 
            : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-sda-blue"
        )}
      />
      {error && <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase">{error}</p>}
    </div>
  )
);

export default MemberForm;
