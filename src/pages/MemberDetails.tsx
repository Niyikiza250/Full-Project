import React from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useMember } from '@/services/memberService';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { 
  ArrowLeft, Edit, Trash2, MapPin, Phone, Mail, Calendar, 
  ShieldCheck, Church, User, Loader2, History, Award, Map
} from 'lucide-react';
import { clsx } from 'clsx';

const MemberDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'SUPER_ADMIN';
  const isChurchLeader = user?.role === 'CHURCH_LEADER';
  const isMinistryLeader = user?.role === 'MINISTRY_LEADER';
  const canEdit = isAdmin || isChurchLeader || isMinistryLeader;
  const { data: member, isLoading } = useMember(id || '');

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sda-blue" size={48} />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('member.detailsNotFound')}</h2>
        <button 
          onClick={() => navigate(ROUTES.MEMBERS)}
          className="mt-4 bg-sda-blue text-white px-6 py-2 rounded-xl font-bold shadow-lg flex items-center justify-center mx-auto transition-transform active:scale-95"
        >
          <ArrowLeft size={16} className="mr-2" /> {t('member.backToDirectory')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Actions */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => navigate(ROUTES.MEMBERS)}
          className="text-slate-500 hover:text-sda-blue flex items-center transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} className="mr-2" /> {t('member.backToDirectory')}
        </button>
        <div className="flex space-x-3">
          {canEdit && (
            <>
              <button 
                onClick={() => navigate(ROUTES.MEMBER_EDIT.replace(':id', member.id))}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center hover:text-sda-blue transition-colors shadow-sm"
              >
                <Edit size={16} className="mr-2" /> {t('member.editProfile')}
              </button>
              <button className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-xl font-bold text-sm flex items-center hover:bg-red-600 hover:text-white transition-all shadow-sm">
                <Trash2 size={16} className="mr-2" /> {t('member.delete')}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Profile Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-32 sm:h-40 bg-sda-blue relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          </div>
          <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-10">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 p-1.5 border-4 border-white dark:border-slate-900 shadow-xl">
              <div className="w-full h-full rounded-xl sm:rounded-2xl bg-sda-blue/10 dark:bg-sda-blue/20 flex items-center justify-center text-sda-blue text-2xl sm:text-4xl font-bold shadow-inner">
                {member.firstName[0]}{member.lastName[0]}
              </div>
            </div>
          </div>
        </div>
        <div className="pt-16 sm:pt-20 pb-6 sm:pb-10 px-4 sm:px-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {member.firstName} {member.lastName}
                </h1>
                <span className={clsx(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                  member.status === 'ACTIVE' ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50 text-slate-600 border-slate-200"
                )}>
                  {member.status}
                </span>
              </div>
              <p className="text-slate-500 mt-2 flex items-center font-medium">
                <ShieldCheck size={16} className="mr-2 text-sda-blue" /> 
                {t('member.systemId')} <span className="text-slate-900 dark:text-slate-200 ml-1 font-bold">#MIS-{member.id.padStart(5, '0')}</span>
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <HeaderStat label={t('member.governanceRole')} value={getTranslatedRoleLabel(member.role, t)} icon={<Award />} />
              <HeaderStat label={t('member.localPlacement')} value={member.churchName} icon={<Church />} />
              <HeaderStat label={t('member.filterZone')} value={member.zoneName} icon={<Map />} />
              <HeaderStat label={t('member.missionField')} value={member.fieldName} icon={<Map />} />
              {member.sabbathClass && (
                <HeaderStat label={t('member.filterClass')} value={member.sabbathClass} icon={<Calendar />} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact & Personal Data */}
        <div className="lg:col-span-1 space-y-6">
          <DetailCard title={t('member.contactInfo')} icon={<Phone size={18} />}>
            <div className="space-y-5">
              <InfoItem label={t('member.primaryEmail')} value={member.email} icon={<Mail size={16} />} />
              <InfoItem label={t('member.phoneNumber')} value={member.phone} icon={<Phone size={16} />} />
              <InfoItem label={t('member.address')} value={member.address} icon={<MapPin size={16} />} />
            </div>
          </DetailCard>

          <DetailCard title={t('member.personalBackground')} icon={<User size={18} />}>
            <div className="space-y-5">
              <InfoItem label={t('member.gender')} value={member.gender} />
              <InfoItem label={t('member.dateOfBirth')} value={new Date(member.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' })} icon={<Calendar size={16} />} />
              <InfoItem label={t('member.memberSince')} value={new Date(member.joinDate).toLocaleDateString(undefined, { dateStyle: 'long' })} icon={<Calendar size={16} />} />
            </div>
          </DetailCard>
        </div>

        {/* Activity & History */}
        <div className="lg:col-span-2 space-y-6">
          <DetailCard title={t('member.spiritualActivity')} icon={<History size={18} />}>
            <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8 py-2">
              {member.activities.length === 0 ? (
                <p className="text-slate-500 italic text-sm">{t('member.noActivity')}</p>
              ) : (
                member.activities.map((activity) => (
                  <div key={activity.id} className="relative">
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-sda-blue"></div>
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-tight">{activity.type.replace('_', ' ')}</h4>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">{activity.description}</p>
                      <div className="mt-2 inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
                        {t('member.performedBy')} {activity.performedBy}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DetailCard>

          {/* Quick Stats/Badges Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('member.baptismStatus')}</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">{member.baptismDate ? t('member.baptizedMember') : t('member.regularAttendee')}</div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center space-x-4">
              <div className="w-12 h-12 bg-sda-gold/10 text-sda-gold rounded-xl flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('member.governanceTier')}</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">{t('member.unionRecognized')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Subcomponents
const DetailCard = ({ title, icon, children }: any) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
    <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
      <div className="p-2 bg-sda-blue/5 text-sda-blue rounded-lg">{icon}</div>
      <h3 className="font-bold text-lg tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const InfoItem = ({ label, value, icon }: any) => (
  <div className="group">
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
    <div className="mt-1 flex items-center text-sm font-bold text-slate-800 dark:text-slate-200">
      {icon && <span className="mr-2 text-slate-400">{icon}</span>}
      {value}
    </div>
  </div>
);

const HeaderStat = ({ label, value, icon }: any) => (
  <div className="flex items-center space-x-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800">
    <div className="text-sda-blue">{React.cloneElement(icon, { size: 18 })}</div>
    <div>
      <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">{label}</div>
      <div className="text-xs font-bold text-slate-800 dark:text-white mt-1 uppercase">{value}</div>
    </div>
  </div>
);

export default MemberDetails;
