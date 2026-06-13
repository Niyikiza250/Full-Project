import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { Mail, Lock, Loader2, User, Church, MapPin, ChevronDown, Info, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { useFields, useDistricts, useChurches } from '@/services/locationService';
import { motion, AnimatePresence } from 'framer-motion';
import { rwandaLocation } from '@devrw/rwanda-location';

type AccountType = 'member' | 'volunteer';

interface RegistrationData {
  fieldId: string;
  districtId: string;
  churchId: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface VolLocation {
  provinceCode: number | null;
  provinceName: string | null;
  districtCode: number | null;
  districtName: string | null;
  sectorCode: string | null;
  sectorName: string | null;
  cellCode: number | null;
  cellName: string | null;
  villageCode: number | null;
  villageName: string | null;
}

const COUNTRY_CODES = [
  { code: '+250', label: '🇷🇼 Rwanda +250' },
  { code: '+256', label: '🇺🇬 Uganda +256' },
  { code: '+254', label: '🇰🇪 Kenya +254' },
  { code: '+255', label: '🇹🇿 Tanzania +255' },
  { code: '+257', label: '🇧🇮 Burundi +257' },
  { code: '+243', label: '🇨🇩 DRC +243' },
  { code: '+1', label: '🇺🇸 USA/CA +1' },
  { code: '+44', label: '🇬🇧 UK +44' },
  { code: '+27', label: '🇿🇦 South Africa +27' },
  { code: '+233', label: '🇬🇭 Ghana +233' },
  { code: '+234', label: '🇳🇬 Nigeria +234' },
  { code: '+251', label: '🇪🇹 Ethiopia +251' },
  { code: '+211', label: '🇸🇸 South Sudan +211' },
  { code: '+260', label: '🇿🇲 Zambia +260' },
  { code: '+263', label: '🇿🇼 Zimbabwe +263' },
  { code: '+33', label: '🇫🇷 France +33' },
  { code: '+49', label: '🇩🇪 Germany +49' },
  { code: '+31', label: '🇳🇱 Netherlands +31' },
  { code: '+46', label: '🇸🇪 Sweden +46' },
  { code: '+61', label: '🇦🇺 Australia +61' },
  { code: '+86', label: '🇨🇳 China +86' },
  { code: '+91', label: '🇮🇳 India +91' },
];

const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<AccountType>('member');
  const [formData, setFormData] = useState<RegistrationData>({
    fieldId: '',
    districtId: '',
    churchId: '',
    fullName: '',
    email: '',
    countryCode: '+250',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [volLocation, setVolLocation] = useState<VolLocation>({
    provinceCode: null,
    provinceName: null,
    districtCode: null,
    districtName: null,
    sectorCode: null,
    sectorName: null,
    cellCode: null,
    cellName: null,
    villageCode: null,
    villageName: null,
  });

  const { data: fieldsData } = useFields({ limit: 100 });
  const { data: districtsData } = useDistricts({ limit: 500 });
  const { data: churchesData } = useChurches({ limit: 1000 });

  const fields = fieldsData?.data ?? [];
  const districts = districtsData?.data ?? [];
  const churches = churchesData?.data ?? [];

  const availableDistricts = useMemo(
    () => districts.filter((d) => d.fieldId === formData.fieldId),
    [districts, formData.fieldId]
  );

  const availableChurches = useMemo(
    () => churches.filter((c) => c.districtId === formData.districtId),
    [churches, formData.districtId]
  );

  const selectedField = fields.find((f) => f.id === formData.fieldId);
  const selectedDistrict = districts.find((d) => d.id === formData.districtId);
  const selectedChurch = churches.find((c) => c.id === formData.churchId);

  const fieldSelected = !!formData.fieldId;
  const districtSelected = !!formData.districtId;
  const churchSelected = !!formData.churchId;
  const memberCanSubmit = fieldSelected && districtSelected && churchSelected;

  const provinces = useMemo(() => rwandaLocation.getProvinces(), []);
  const volDistricts = useMemo(
    () => (volLocation.provinceCode ? rwandaLocation.getDistricts(volLocation.provinceCode) : []),
    [volLocation.provinceCode]
  );
  const volSectors = useMemo(
    () => (volLocation.districtCode ? rwandaLocation.getSectors(volLocation.districtCode) : []),
    [volLocation.districtCode]
  );
  const volCells = useMemo(
    () => (volLocation.sectorCode ? rwandaLocation.getCells(volLocation.sectorCode) : []),
    [volLocation.sectorCode]
  );
  const volVillages = useMemo(
    () => (volLocation.cellCode ? rwandaLocation.getVillages(volLocation.cellCode) : []),
    [volLocation.cellCode]
  );

  const volLocationComplete = !!(
    volLocation.provinceCode &&
    volLocation.districtCode &&
    volLocation.sectorCode &&
    volLocation.cellCode &&
    volLocation.villageCode
  );

  const handleAccountTypeChange = (type: AccountType) => {
    setAccountType(type);
    setFormData({ fieldId: '', districtId: '', churchId: '', fullName: '', email: '', countryCode: '+250', phone: '', password: '', confirmPassword: '' });
    setVolLocation({ provinceCode: null, provinceName: null, districtCode: null, districtName: null, sectorCode: null, sectorName: null, cellCode: null, cellName: null, villageCode: null, villageName: null });
    setErrors({});
  };

  const handleSelectChange = (field: keyof RegistrationData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'fieldId') { next.districtId = ''; next.churchId = ''; }
      if (field === 'districtId') { next.churchId = ''; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleVolLocationChange = (field: keyof VolLocation, value: number | string | null, name?: string | null) => {
    setVolLocation((prev) => {
      const nameField = field.toString().replace('Code', 'Name') as keyof VolLocation;
      const next = { ...prev, [field]: value, [nameField]: name ?? null };
      if (field === 'provinceCode') { next.districtCode = null; next.districtName = null; next.sectorCode = null; next.sectorName = null; next.cellCode = null; next.cellName = null; next.villageCode = null; next.villageName = null; }
      if (field === 'districtCode') { next.sectorCode = null; next.sectorName = null; next.cellCode = null; next.cellName = null; next.villageCode = null; next.villageName = null; }
      if (field === 'sectorCode') { next.cellCode = null; next.cellName = null; next.villageCode = null; next.villageName = null; }
      if (field === 'cellCode') { next.villageCode = null; next.villageName = null; }
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (accountType === 'member') {
      if (!formData.fieldId) errs.fieldId = t('auth.fieldRequired');
      if (!formData.districtId) errs.districtId = t('auth.districtRequired');
      if (!formData.churchId) errs.churchId = t('auth.churchRequired');
    }
    if (accountType === 'volunteer') {
      if (!volLocation.provinceCode) errs.volProvince = 'Province is required';
      if (!volLocation.districtCode) errs.volDistrict = 'District is required';
      if (!volLocation.sectorCode) errs.volSector = 'Sector is required';
      if (!volLocation.cellCode) errs.volCell = 'Cell is required';
      if (!volLocation.villageCode) errs.volVillage = 'Village is required';
    }
    if (formData.fullName.length < 2) errs.fullName = t('auth.validation.fullNameMin');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = t('auth.validation.emailInvalid');
    if (!formData.countryCode) errs.countryCode = 'Country code is required';
    if (!formData.phone) errs.phone = 'Phone number is required';
    if (formData.password.length < 6) errs.password = t('auth.validation.passwordMin');
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = t('auth.validation.passwordsDontMatch');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    navigate(ROUTES.LOGIN);
  };

  const progressSteps = accountType === 'member' ? 4 : 2;

  const renderSelect = (
    label: string,
    value: string | number | null,
    options: { value: string | number; label: string }[],
    placeholder: string,
    onChange: (v: string) => void,
    errorKey?: string,
    icon?: React.ReactNode
  ) => (
    <div>
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <select
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full pl-11 pr-10 py-3.5 rounded-xl border-2 appearance-none text-sm font-semibold transition-all duration-200 outline-none cursor-pointer',
            'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700',
            'hover:border-sda-blue/50 dark:hover:border-sda-gold/50 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20',
            value && 'border-sda-blue dark:border-sda-gold'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {errorKey && errors[errorKey] && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors[errorKey]}</p>}
      {options.length === 0 && value && (
        <p className="text-xs text-slate-400 italic mt-1">No options available</p>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.registerHeading')}</h2>
        <p className="text-sm text-slate-500 mt-1">{t('auth.registerSubtitle')}</p>
      </div>

      {/* ====== Account Type Selector ====== */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          type="button"
          onClick={() => handleAccountTypeChange('member')}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200',
            accountType === 'member'
              ? 'bg-sda-blue text-white shadow-lg shadow-sda-blue/20 ring-2 ring-sda-gold/40'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-sda-blue/50 dark:hover:border-sda-gold/50'
          )}
        >
          Member
        </motion.button>
        <motion.button
          type="button"
          onClick={() => handleAccountTypeChange('volunteer')}
          whileTap={{ scale: 0.97 }}
          className={cn(
            'py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200',
            accountType === 'volunteer'
              ? 'bg-sda-blue text-white shadow-lg shadow-sda-blue/20 ring-2 ring-sda-gold/40'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-2 border-slate-200 dark:border-slate-700 hover:border-sda-blue/50 dark:hover:border-sda-gold/50'
          )}
        >
          Volunteer
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2">
        {Array.from({ length: progressSteps }).map((_, i) => {
          const step = i + 1;
          let filled = false;
          if (accountType === 'member') {
            filled =
              (step === 1 && fieldSelected) ||
              (step === 2 && districtSelected) ||
              (step === 3 && churchSelected) ||
              (step === 4 && memberCanSubmit);
          } else {
            filled =
              (step === 1 && volLocationComplete) ||
              (step === 2);
          }
          return (
            <React.Fragment key={step}>
              <div
                className={cn(
                  'flex-1 h-1.5 rounded-full transition-all duration-500',
                  filled ? 'bg-sda-blue' : 'bg-slate-200 dark:bg-slate-700'
                )}
              />
            </React.Fragment>
          );
        })}
      </div>

      {/* ====== MEMBER: Mission Field Sections ====== */}
      {accountType === 'member' && (
        <>
          {/* Mission Field */}
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
                {fields.map((f) => (
                  <option key={f.id} value={f.id} className="bg-sda-blue text-white py-2">{f.name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.fieldId && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.fieldId}</p>}
          </div>

          {/* District */}
          <AnimatePresence>
            {fieldSelected && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut' }} className="space-y-1">
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

          {/* Church */}
          <AnimatePresence>
            {districtSelected && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut', delay: 0.05 }} className="space-y-1">
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
        </>
      )}

      {/* ====== VOLUNTEER: Rwanda Location Cascade ====== */}
      {accountType === 'volunteer' && (
        <div className="space-y-3">
          {renderSelect(
            'Province',
            volLocation.provinceCode,
            provinces.map((p: any) => ({ value: p.code, label: p.name })),
            'Select Province...',
            (v) => {
              const province = provinces.find((p: any) => p.code === Number(v));
              handleVolLocationChange('provinceCode', v ? Number(v) : null, province?.name || null);
            },
            'volProvince',
            <MapPin size={18} />
          )}

          <AnimatePresence>
            {volLocation.provinceCode && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {renderSelect(
                  'District',
                  volLocation.districtCode,
                  volDistricts.map((d: any) => ({ value: d.code, label: d.name })),
                  'Select District...',
                  (v) => {
                    const district = volDistricts.find((d: any) => d.code === Number(v));
                    handleVolLocationChange('districtCode', v ? Number(v) : null, district?.name || null);
                  },
                  'volDistrict'
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {volLocation.districtCode && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {renderSelect(
                  'Sector',
                  volLocation.sectorCode,
                  volSectors.map((s: any) => ({ value: s.code, label: s.name })),
                  'Select Sector...',
                  (v) => {
                    const sector = volSectors.find((s: any) => s.code === v);
                    handleVolLocationChange('sectorCode', v || null, sector?.name || null);
                  },
                  'volSector'
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {volLocation.sectorCode && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {renderSelect(
                  'Cell',
                  volLocation.cellCode,
                  volCells.map((c: any) => ({ value: c.code, label: c.name })),
                  'Select Cell...',
                  (v) => {
                    const cell = volCells.find((c: any) => c.code === Number(v));
                    handleVolLocationChange('cellCode', v ? Number(v) : null, cell?.name || null);
                  },
                  'volCell'
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {volLocation.cellCode && (
              <motion.div {...slideUp} transition={{ duration: 0.3, ease: 'easeOut' }}>
                {renderSelect(
                  'Village',
                  volLocation.villageCode,
                  volVillages.map((v: any) => ({ value: v.code, label: v.name })),
                  'Select Village...',
                  (v) => {
                    const village = volVillages.find((vl: any) => vl.code === Number(v));
                    handleVolLocationChange('villageCode', v ? Number(v) : null, village?.name || null);
                  },
                  'volVillage'
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ====== Account Details ====== */}
      <AnimatePresence>
        {(accountType === 'volunteer' || (accountType === 'member' && churchSelected)) && (
          <motion.div
            {...slideUp}
            transition={{ duration: 0.35, ease: 'easeOut', delay: 0.05 }}
            className="space-y-4"
          >
            {/* Selection summary (Member only) */}
            {accountType === 'member' && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-sda-blue/5 dark:bg-sda-gold/5 border border-sda-blue/10 dark:border-sda-gold/10 text-xs font-semibold text-slate-600 dark:text-slate-400">
                <Info size={14} className="text-sda-blue dark:text-sda-gold shrink-0" />
                <span>{selectedField?.name} &rsaquo; {selectedDistrict?.name} &rsaquo; {selectedChurch?.name}</span>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Phone</label>
              <div className="relative flex">
                <div className="relative shrink-0">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" size={18} />
                  <select
                    value={formData.countryCode}
                    onChange={(e) => { setFormData((p) => ({ ...p, countryCode: e.target.value })); setErrors((p) => ({ ...p, countryCode: '' })); }}
                    className="h-full rounded-l-xl border-2 border-r-0 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-9 pr-6 py-3 text-sm font-semibold text-slate-900 dark:text-white appearance-none focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all cursor-pointer"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code}>{c.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => { setFormData((p) => ({ ...p, phone: e.target.value })); setErrors((p) => ({ ...p, phone: '' })); }}
                  className="flex-1 rounded-r-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-4 pr-4 py-3 text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:border-sda-blue dark:focus:border-sda-gold focus:ring-2 focus:ring-sda-blue/20 dark:focus:ring-sda-gold/20 outline-none transition-all"
                  placeholder="788 123 456"
                />
              </div>
              {(errors.countryCode || errors.phone) && (
                <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.countryCode || errors.phone}</p>
              )}
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
