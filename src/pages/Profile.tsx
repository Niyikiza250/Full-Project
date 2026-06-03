import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { 
  User, Mail, Phone, MapPin, Shield, Calendar, CheckCircle2, 
  Camera, Key, Save, AlertCircle, Clock, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, updateProfilePicture, updateUserFields } = useAuthStore();
  const [imageError, setImageError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState(user?.name || 'John Doe');
  const [email, setEmail] = useState(user?.email || 'john.doe@example.com');
  const [phone, setPhone] = useState('+250 788 123 456');
  const [location, setLocation] = useState('Kigali, Rwanda');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Message states
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserFields({ name, email });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError(t('profile.pwdFieldsRequired'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError(t('profile.pwdMismatch'));
      return;
    }
    setPwdError('');
    setPwdSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPwdSuccess(false), 3000);
  };

  // Mock activity logs
  const activities = [
    { id: 1, action: t('profile.activityLoggedIn'), ip: '197.243.12.8', date: 'May 19, 2026 12:45 PM' },
    { id: 2, action: t('profile.activityUpdatedProfile'), ip: '197.243.12.8', date: 'May 18, 2026 09:12 AM' },
    { id: 3, action: t('profile.activityGeneratedReport'), ip: '197.243.12.8', date: 'May 15, 2026 04:30 PM' },
  ];

  // Dynamic role info based on user.role
  const getRoleAssignment = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return { title: t('profile.roleAdminTitle'), details: t('profile.roleAdminDetail') };
      case 'UNION_LEADER':
        return { title: t('profile.roleUnionLeaderTitle'), details: t('profile.roleUnionLeaderDetail') };
      case 'FIELD_LEADER':
        return { title: t('profile.roleFieldLeaderTitle'), details: t('profile.roleFieldLeaderDetail') };
      case 'DISTRICT_LEADER':
        return { title: t('profile.roleZoneLeaderTitle'), details: t('profile.roleZoneLeaderDetail') };
      case 'CHURCH_LEADER':
        return { title: t('profile.roleChurchLeaderTitle'), details: t('profile.roleChurchLeaderDetail') };
      case 'MINISTRY_LEADER':
        return { title: 'Ministry Leader', details: 'Manages ministry programs, volunteers, and events.' };
      case 'VOLUNTEER':
        return { title: 'Volunteer', details: 'Registered volunteer for ministry activities.' };
      case 'MEMBER':
      default:
        return { title: t('profile.roleMemberTitle'), details: t('profile.roleMemberDetail') };
    }
  };

  const roleInfo = getRoleAssignment();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-6xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('nav.profile')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card & Metadata */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-sda-blue to-sda-blue-dark" />
            
            {/* Avatar container */}
            <div className="relative mt-8 mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-extrabold text-3xl text-sda-blue dark:text-sda-gold shadow-md overflow-hidden">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={t('profile.avatarAlt')} className="w-full h-full object-cover" />
                ) : (
                  name.charAt(0)
                )}
              </div>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Validation
                  if (!file.type.startsWith('image/')) {
                    setImageError(t('profile.imageError'));
                    return;
                  }
                  
                  setImageError(null);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    updateProfilePicture(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 p-2 bg-sda-gold text-sda-blue rounded-full border-2 border-white dark:border-slate-900 shadow-md hover:scale-105 transition-transform cursor-pointer flex items-center justify-center"
                title={t('profile.uploadPhoto')}
              >
                <Camera size={16} />
              </label>
              {user?.profilePicture && (
                <button
                  type="button"
                  onClick={() => updateProfilePicture(undefined)}
                  className="absolute -top-1 -right-1 p-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-xs hover:scale-105 transition-transform flex items-center justify-center text-[8px] font-bold"
                  title={t('profile.removePhoto')}
                >
                  ✕
                </button>
              )}
            </div>

            {imageError && (
              <p className="text-[10px] text-red-500 font-bold mb-2">{imageError}</p>
            )}

            {/* Profile detail */}
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white leading-tight">{name}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{email}</p>
            
            {/* Role Badge */}
            <span className="mt-4 px-3 py-1 text-xs font-extrabold bg-sda-blue/10 dark:bg-sda-gold/10 text-sda-blue dark:text-sda-gold-light rounded-full uppercase tracking-wider">
              {getTranslatedRoleLabel(user?.role, t)}
            </span>

            {/* Status and Details */}
            <div className="w-full border-t border-slate-100 dark:border-slate-800 mt-6 pt-6 space-y-3.5 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{t('common.status')}</span>
                <span className="flex items-center gap-1 font-bold text-green-600 dark:text-green-400">
                  <CheckCircle2 size={14} /> {t('profile.activeVerified')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{t('profile.scope')}</span>
                <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[160px]" title={roleInfo.title}>
                  {roleInfo.title}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">{t('profile.detail')}</span>
                <span className="font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[160px]" title={roleInfo.details}>
                  {roleInfo.details}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Quick Details */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <Shield size={16} className="text-sda-blue dark:text-sda-gold" />
              {t('profile.assignmentScope')}
            </h4>
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex gap-2">
                <MapPin className="text-slate-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{t('profile.territoryOffice')}</p>
                  <p className="text-slate-500 dark:text-slate-400">{t('profile.territoryOfficeDetail')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Calendar className="text-slate-400 shrink-0 mt-0.5" size={14} />
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">{t('profile.memberSince')}</p>
                  <p className="text-slate-500 dark:text-slate-400">{t('profile.memberSinceValue')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Forms & Activity Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit profile form */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <User size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('profile.personalInfo')}
            </h3>
            
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.fullName')}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.emailAddress')}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.phoneNumber')}</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.location')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs font-semibold pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {profileSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-green-200 dark:border-green-900/50">
                  <CheckCircle2 size={16} /> {t('profile.successSave')}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-sda-blue hover:bg-sda-blue-dark dark:bg-sda-gold dark:hover:bg-sda-gold-light dark:text-sda-blue font-bold text-white text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Save size={14} />
                  {t('profile.saveChanges')}
                </button>
              </div>
            </form>
          </div>

          {/* Change password */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Key size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('profile.securitySection')}
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.currentPassword')}</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.newPassword')}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{t('profile.confirmPassword')}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full text-xs font-semibold px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {pwdError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200 dark:border-red-900/50">
                  <AlertCircle size={16} /> {pwdError}
                </div>
              )}

              {pwdSuccess && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-green-200 dark:border-green-900/50">
                  <CheckCircle2 size={16} /> {t('profile.successPassword')}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 font-bold text-white text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {t('profile.updateCredentials')}
                </button>
              </div>
            </form>
          </div>

          {/* Activity summary */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-5 flex items-center gap-2">
              <Clock size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('profile.recentActivity')}
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {activities.map((act) => (
                <div key={act.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-700 dark:text-slate-300">{act.action}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{t('profile.ipAddress')} {act.ip}</p>
                  </div>
                  <span className="text-slate-400 font-semibold">{act.date}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
