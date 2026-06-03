import React, { useEffect, useState } from 'react';
import { 
  UserCheck, Award, Calendar, Bell, ChevronRight, Bookmark, Megaphone, Settings,
  Pencil, Check, X
} from 'lucide-react';
import { useHierarchicalAnnouncements } from '@/hooks/useCommunicationModule';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { AnimatePresence, motion } from 'framer-motion';
import { MOCK_CHURCHES, MOCK_CLASSES, MOCK_DISTRICTS } from '@/data/enterpriseMocks';
import { useBlueCardStore } from '@/store/useBlueCardStore';
import { useAuthStore } from '@/store/useAuthStore';
import { BlueCardAdminPanel } from '@/components/dashboard/BlueCardAdminPanel';

const ATTENDANCE_HISTORY = [
  { day: 'S1', present: 1 },
  { day: 'S2', present: 1 },
  { day: 'S3', present: 0 },
  { day: 'S4', present: 1 },
  { day: 'S5', present: 1 },
];

export const MemberDashboard: React.FC = () => {
  const { data: announcements, isLoading } = useHierarchicalAnnouncements();
  const latestAnnouncements = announcements?.slice(0, 3) || [];
  const [activeMotto, setActiveMotto] = useState(0);
  const [adminPanelOpen, setAdminPanelOpen] = useState(false);

  const user = useAuthStore((s) => s.user);
  const [selectedClassId, setSelectedClassId] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN';
  const memberChurchId = user?.churchId ?? '';
  const memberChurch = MOCK_CHURCHES.find((c) => c.id === memberChurchId);
  const memberDistrict = memberChurch ? MOCK_DISTRICTS.find((d) => d.id === memberChurch.districtId) : null;
  const districtChurchIds = memberDistrict
    ? MOCK_CHURCHES.filter((c) => c.districtId === memberDistrict.id).map((c) => c.id)
    : [memberChurchId];
  const classOptions = MOCK_CLASSES.filter((c) => districtChurchIds.includes(c.churchId));
  const selectedClass = MOCK_CLASSES.find((c) => c.id === selectedClassId);

  const card = useBlueCardStore((s) => s.cards.find((c) => c.id === s.activeCardId));
  const missionWords = card?.missionWords ?? [];

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveMotto((current) => (current + 1) % (missionWords.length || 1));
    }, 30000);

    return () => window.clearInterval(intervalId);
  }, [missionWords.length]);

  return (
    <div className="space-y-4">

      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-sda-blue to-sda-blue-dark text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
          <Bookmark size={260} />
        </div>

        {/* Admin edit button */}
        {isAdmin && (
          <button
            type="button"
            onClick={() => setAdminPanelOpen(true)}
            className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors text-white/80 hover:text-white"
            title={'Manage Blue Card'}
          >
            <Settings size={16} />
          </button>
        )}

        <div className="relative z-10 grid gap-6 md:grid-cols-2 md:items-center">
          <div className="max-w-lg">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-sda-gold/20 text-sda-gold-light px-2.5 py-1 rounded-full">
              {memberChurch?.name ?? card?.congregationLabel ?? 'Kigali Central Congregation'}
            </span>
            <h2 className="text-2xl font-extrabold mt-3 tracking-tight">
              {card?.mainTitle ?? 'Active Sabbath Fellowship'}
            </h2>
            <p className="text-xs text-white/80 mt-1.5 leading-relaxed">
              {card?.welcomeMessage ?? 'Welcome to your member portal. Access local announcements, track your attendance, and discover upcoming small groups.'}
            </p>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-white/12 px-2.5 py-1 text-[8px] font-extrabold uppercase tracking-[0.22em] text-sda-gold-light">
                {card?.missionWordsLabel ?? 'MIFEM MOTO'}
              </span>
              {missionWords.length > 1 && (
                <div className="flex gap-1.5">
                  {missionWords.map((motto, index) => (
                    <button
                      key={motto.id}
                      type="button"
                      onClick={() => setActiveMotto(index)}
                      className={`h-2.5 rounded-full transition-all ${
                        index === activeMotto ? 'w-8 bg-sda-gold-light' : 'w-2.5 bg-white/35 hover:bg-white/55'
                      }`}
                      aria-label={motto.title}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="relative min-h-[110px]">
              <AnimatePresence mode="wait">
                {missionWords.length > 0 ? (
                  <motion.div
                    key={missionWords[activeMotto % missionWords.length].id}
                    initial={{ opacity: 0, x: 42 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -26 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 flex flex-col justify-center"
                  >
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sda-gold-light">
                      {missionWords[activeMotto % missionWords.length].title}
                    </p>
                    <p className="mt-2.5 text-xs font-semibold leading-5 text-white/92">
                      {missionWords[activeMotto % missionWords.length].body}
                    </p>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex flex-col justify-center">
                    <p className="text-xs italic text-white/50">{'No mission words yet. Admin can add them.'}</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MemberKPI title={'Personal Attendance'} value={'92%'} desc={'Checked in 11/12 Sabbaths'} icon={<UserCheck className="text-sda-blue" />} />
        <SabbathSchoolEditCard
          classOptions={classOptions}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          churchName={memberChurch?.name ?? ''}
          districtName={memberDistrict?.name ?? ''}
        />
        <MemberKPI title={'Registered Ministries'} value={'2 Active'} desc={'Pathfinder, Praise Team'} icon={<Award className="text-indigo-600" />} />
        <MemberKPI title={'Events Attending'} value={'3 Upcoming'} desc={'Reserved in portal'} icon={<Calendar className="text-green-600" />} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Attendance Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{'Recent Attendance Logs'}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{'Verify your digital check-in logs'}</p>
          </div>
          
          <div className="my-4 space-y-2.5 text-xs">
            <AttendanceLogItem title={'Sabbath Session — May 16'} present={true} time={'09:12 AM via QR'} />
            <AttendanceLogItem title={'Sabbath Session — May 09'} present={true} time={'08:44 AM via QR'} />
            <AttendanceLogItem title={'Sabbath Session — May 02'} present={false} time={'Absent'} />
            <AttendanceLogItem title={'Sabbath Session — Apr 25'} present={true} time={'09:05 AM Manual'} />
          </div>

          <span className="text-[10px] text-slate-400 font-semibold text-center block">
            {'Scan lobby QR code every Sabbath morning to record attendance automatically.'}
          </span>
        </div>

        {/* Local Events list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-3">{'Register for Upcoming Events'}</h3>
            <div className="space-y-3 text-xs">
              <MemberEventItem title={'Pathfinder Camporee 2026'} desc={'National Youth campground assembly'} date={'June 12'} />
              <MemberEventItem title={'Family Fellowship Lunch'} desc={'Shared lunch event at Central Hall'} date={'May 23'} />
            </div>
          </div>
          <button className="w-full mt-4 bg-sda-blue hover:bg-sda-blue-dark dark:bg-sda-gold dark:hover:bg-sda-gold-light dark:text-sda-blue font-bold text-white text-xs py-2.5 rounded-xl cursor-pointer">
            {'Explore All Church Events'}
          </button>
        </div>

        {/* Personal Bulletin Board */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-3 flex items-center gap-1.5">
              <Bell size={16} className="text-sda-gold" />
              {'Announcements For You'}
            </h3>
            <div className="space-y-3.5 text-xs leading-relaxed">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              ) : latestAnnouncements.length === 0 ? (
                <p className="text-slate-400 italic">{'No recent announcements.'}</p>
              ) : (
                latestAnnouncements.map((a, idx) => (
                  <div key={a.id} className={idx > 0 ? "border-t border-slate-100 dark:border-slate-800 pt-3" : ""}>
                    <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      {a.priority === 'URGENT' && <Megaphone size={12} className="text-red-500" />}
                      {a.title}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{a.body}</p>
                  </div>
                ))
              )}
            </div>
          </div>
          <Link to={ROUTES.COMMUNICATION} className="w-full mt-4 flex items-center justify-center gap-0.5 text-[11px] font-bold text-sda-blue dark:text-sda-gold hover:underline">
            {'View All Announcements'} <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Admin panel dialog */}
      <BlueCardAdminPanel open={adminPanelOpen} onClose={() => setAdminPanelOpen(false)} />
    </div>
  );
};

const MemberKPI = ({ title, value, desc, icon }: any) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-bold text-slate-400">{title}</span>
      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:scale-105 transition-transform duration-300">
        {icon}
      </div>
    </div>
    <div className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">{value}</div>
    <p className="text-[10px] text-slate-400 font-medium mt-1">{desc}</p>
  </div>
);

const AttendanceLogItem = ({ title, present, time }: any) => {
  return (
  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
    <div>
      <p className="font-bold text-slate-800 dark:text-slate-200">{title}</p>
      <span className="text-[9px] text-slate-400 font-semibold">{time}</span>
    </div>
    <div>
      {present ? (
        <span className="text-[9px] font-extrabold bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full uppercase">
          {'PRESENT'}
        </span>
      ) : (
        <span className="text-[9px] font-extrabold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full uppercase">
          {'ABSENT'}
        </span>
      )}
    </div>
  </div>
  );
};

const SabbathSchoolEditCard = ({
  classOptions,
  selectedClassId,
  setSelectedClassId,
  churchName,
  districtName,
}: {
  classOptions: { id: string; name: string }[];
  selectedClassId: string;
  setSelectedClassId: (v: string) => void;
  churchName: string;
  districtName: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [draftId, setDraftId] = useState(selectedClassId);

  const displayClass = MOCK_CLASSES.find((c) => c.id === selectedClassId);

  const openEditor = () => {
    setDraftId(selectedClassId);
    setEditing(true);
  };

  const save = () => {
    setSelectedClassId(draftId);
    setEditing(false);
  };

  const cancel = () => {
    setDraftId(selectedClassId);
    setEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs relative overflow-hidden">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-bold text-slate-400">{'Sabbath School Class'}</span>
        <div className="flex items-center gap-1.5">
          {editing && (
            <button type="button" onClick={cancel} className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={editing ? save : openEditor}
            className={`p-2 rounded-xl transition-all ${
              editing
                ? 'bg-sda-blue text-white hover:bg-sda-blue-dark shadow-md shadow-sda-blue/20'
                : 'bg-slate-100 dark:bg-slate-800 text-sda-blue dark:text-sda-gold hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {editing ? <Check size={16} /> : <Pencil size={16} />}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-3 mt-2">
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2 text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">
            {churchName || 'Select a church first'}
            {districtName && <span className="block text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{districtName}</span>}
          </div>
          <div>
            <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-400 mb-1">
              {'Sabbath Class'}
            </label>
            <select
              value={draftId}
              onChange={(e) => setDraftId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
            >
              <option value="">{'Choose your class...'}</option>
              {classOptions.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <>
          <div className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            {displayClass ? displayClass.name : 'Class #4'}
          </div>
          <p className="text-[10px] text-slate-400 font-medium mt-1">
            {churchName || 'Select a church first'}
          </p>
          {districtName && churchName && (
            <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{districtName}</p>
          )}
        </>
      )}
    </div>
  );
};

const MemberEventItem = ({ title, desc, date }: any) => (
  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 rounded-xl flex justify-between items-start">
    <div className="min-w-0 pr-2">
      <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{title}</p>
      <p className="text-[9px] text-slate-400 mt-0.5 leading-normal">{desc}</p>
    </div>
    <div className="bg-white dark:bg-slate-700 shadow-2xs rounded-lg px-2 py-1 text-center shrink-0">
      <span className="text-[10px] font-extrabold text-sda-blue dark:text-sda-gold block leading-none">{date.split(' ')[0]}</span>
      <span className="text-[8px] font-extrabold text-slate-400 dark:text-slate-350 block mt-0.5">{date.split(' ')[1] || ''}</span>
    </div>
  </div>
);
