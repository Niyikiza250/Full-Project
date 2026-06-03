import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuthStore } from '@/store/useAuthStore';
import { useMember } from '@/services/memberService';
import { MOCK_CHANGE_REQUESTS } from '@/utils/mockData';
import { 
  ArrowLeft, Save, Loader2, User, Church, MapPin, 
  Calendar, Camera, Upload, X, Shield, Clock 
} from 'lucide-react';
import { clsx } from 'clsx';

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
  churchName: z.string().min(1, t('member.validation.churchNameRequired')),
  fieldName: z.string().min(1, t('member.validation.fieldNameRequired')),
  zoneName: z.string().min(1, t('member.validation.zoneNameRequired')),
  sabbathClass: z.string().optional(),
  address: z.string().min(1, t('member.validation.addressRequired')),
});

type MemberFormValues = z.infer<ReturnType<typeof memberSchema>>;

const MemberForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isEdit = !!id;
  const canDirectEdit = user?.role === 'SUPER_ADMIN' || user?.role === 'CHURCH_LEADER';
  const needsApproval = user?.role === 'MINISTRY_LEADER';

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'CHURCH_LEADER' && user?.role !== 'MINISTRY_LEADER') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  const { data: member, isLoading: isMemberLoading } = useMember(id || '');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema(t)),
    values: member ? {
      ...member,
      baptismDate: member.baptismDate || '',
    } : undefined,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: MemberFormValues) => {
    if (needsApproval) {
      const changeRequest = {
        id: `cr-${Date.now()}`,
        memberId: isEdit ? id : undefined,
        type: isEdit ? ('UPDATE' as const) : ('CREATE' as const),
        submittedBy: user?.id || '',
        submittedByRole: 'MINISTRY_LEADER' as const,
        submittedByEmail: user?.email || '',
        submittedAt: new Date().toISOString(),
        status: 'PENDING' as const,
        changes: data as any,
      };
      MOCK_CHANGE_REQUESTS.push(changeRequest);
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
              <InputField label={t('member.formResidence')} {...register('address')} error={errors.address?.message} />
            </div>
          </Section>

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
