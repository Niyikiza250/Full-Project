import React, { useState, useMemo } from 'react';
import {
  HandHeart,
  Cross,
  UserCheck,
  Filter,
  Search,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  EyeOff,
  X,
} from 'lucide-react';

type PrayerType = 'PERSONAL' | 'FAMILY' | 'HEALTH' | 'FINANCIAL' | 'SPIRITUAL' | 'OTHER';
type CounselingType = 'PASTORAL' | 'MARITAL' | 'GRIEF' | 'ADDICTION' | 'YOUTH' | 'FINANCIAL' | 'OTHER';
type PrayerStatus = 'PENDING' | 'PRAYING' | 'ANSWERED' | 'CLOSED';
type CounselingStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type Urgency = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
type TabId = 'prayer' | 'counseling';

interface PrayerRequest {
  id: string;
  name: string;
  prayerType: PrayerType;
  status: PrayerStatus;
  date: string;
  isConfidential: boolean;
  description: string;
  submittedBy: string;
}

interface CounselingRequest {
  id: string;
  name: string;
  counselingType: CounselingType;
  urgency: Urgency;
  status: CounselingStatus;
  date: string;
  description: string;
  submittedBy: string;
  assignedTo?: string;
}

const PRAYER_TYPES: PrayerType[] = ['PERSONAL', 'FAMILY', 'HEALTH', 'FINANCIAL', 'SPIRITUAL', 'OTHER'];
const COUNSELING_TYPES: CounselingType[] = ['PASTORAL', 'MARITAL', 'GRIEF', 'ADDICTION', 'YOUTH', 'FINANCIAL', 'OTHER'];
const PRAYER_STATUSES: PrayerStatus[] = ['PENDING', 'PRAYING', 'ANSWERED', 'CLOSED'];
const COUNSELING_STATUSES: CounselingStatus[] = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const URGENCY_LEVELS: Urgency[] = ['LOW', 'NORMAL', 'HIGH', 'URGENT'];

const INITIAL_PRAYERS: PrayerRequest[] = [
  { id: 'PR1', name: 'Jean Baptiste', prayerType: 'HEALTH', status: 'PRAYING', date: '2026-06-10', isConfidential: false, description: 'Prayer for upcoming surgery recovery', submittedBy: 'Pastor Eric' },
  { id: 'PR2', name: 'Marie Claire', prayerType: 'FINANCIAL', status: 'PENDING', date: '2026-06-12', isConfidential: true, description: 'Financial difficulties after job loss', submittedBy: 'Marie Claire' },
  { id: 'PR3', name: 'David Mugisha', prayerType: 'SPIRITUAL', status: 'ANSWERED', date: '2026-06-05', isConfidential: false, description: 'Baptism preparation and spiritual growth', submittedBy: 'Elder Samuel' },
  { id: 'PR4', name: 'Grace Uwimana', prayerType: 'FAMILY', status: 'PENDING', date: '2026-06-13', isConfidential: false, description: 'Family reconciliation prayer request', submittedBy: 'Grace Uwimana' },
  { id: 'PR5', name: 'Peter Habimana', prayerType: 'PERSONAL', status: 'CLOSED', date: '2026-05-28', isConfidential: true, description: 'Personal guidance and direction', submittedBy: 'Peter Habimana' },
];

const INITIAL_COUNSELING: CounselingRequest[] = [
  { id: 'CR1', name: 'Alice Mukamana', counselingType: 'GRIEF', urgency: 'HIGH', status: 'IN_PROGRESS', date: '2026-06-08', description: 'Grief counseling after losing spouse', submittedBy: 'Alice Mukamana', assignedTo: 'Pastor Jean' },
  { id: 'CR2', name: 'Olivier Niyonzima', counselingType: 'MARITAL', urgency: 'URGENT', status: 'PENDING', date: '2026-06-11', description: 'Marital crisis requiring immediate intervention', submittedBy: 'Olivier Niyonzima' },
  { id: 'CR3', name: 'Beatrice Ishimwe', counselingType: 'PASTORAL', urgency: 'NORMAL', status: 'RESOLVED', date: '2026-06-02', description: 'Spiritual direction and life purpose', submittedBy: 'Beatrice Ishimwe', assignedTo: 'Pastor Eric' },
  { id: 'CR4', name: 'Emmanuel Kwizera', counselingType: 'ADDICTION', urgency: 'URGENT', status: 'PENDING', date: '2026-06-13', description: 'Substance abuse addiction help', submittedBy: 'Family Member' },
  { id: 'CR5', name: 'Chantal Uwase', counselingType: 'YOUTH', urgency: 'LOW', status: 'CLOSED', date: '2026-05-20', description: 'Youth identity and career guidance', submittedBy: 'Chantal Uwase', assignedTo: 'Brother Patrick' },
];

const STYLE = {
  card: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all',
  cardHeader: 'flex items-center justify-between gap-3',
  cardTitle: 'text-sm font-extrabold text-slate-800 dark:text-white truncate',
  cardSubtitle: 'text-[10px] text-slate-400 font-medium mt-0.5',
  badge: (color: string) =>
    `inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${color}`,
  input:
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40',
  select:
    'w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40',
  label: 'text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider',
  btn: (variant: 'primary' | 'ghost' | 'danger' = 'primary') => {
    const base = 'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs';
    if (variant === 'primary') return `${base} bg-sda-blue text-white hover:bg-sda-blue-dark`;
    if (variant === 'danger') return `${base} bg-red-500 text-white hover:bg-red-600`;
    return `${base} bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700`;
  },
  tab: (active: boolean) =>
    `px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
      active
        ? 'bg-sda-blue text-white shadow-md'
        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
    }`,
};

const STATUS_PRAYER_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  PRAYING: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  ANSWERED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const STATUS_COUNSELING_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  IN_PROGRESS: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  RESOLVED: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  CLOSED: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const URGENCY_COLORS: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  NORMAL: 'bg-sda-blue/10 text-sda-blue dark:bg-sda-blue/20 dark:text-sda-gold',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const URGENCY_ICONS: Record<string, React.ReactNode> = {
  LOW: <Clock size={12} />,
  NORMAL: <CheckCircle size={12} />,
  HIGH: <AlertCircle size={12} />,
  URGENT: <AlertCircle size={12} />,
};

const PRAYER_TYPE_LABELS: Record<string, string> = {
  PERSONAL: 'Personal', FAMILY: 'Family', HEALTH: 'Health',
  FINANCIAL: 'Financial', SPIRITUAL: 'Spiritual', OTHER: 'Other',
};

const COUNSELING_TYPE_LABELS: Record<string, string> = {
  PASTORAL: 'Pastoral', MARITAL: 'Marital', GRIEF: 'Grief',
  ADDICTION: 'Addiction', YOUTH: 'Youth', FINANCIAL: 'Financial', OTHER: 'Other',
};

const PrayerCounselingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('prayer');
  const [prayers, setPrayers] = useState<PrayerRequest[]>(INITIAL_PRAYERS);
  const [counseling, setCounseling] = useState<CounselingRequest[]>(INITIAL_COUNSELING);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [editPrayer, setEditPrayer] = useState<PrayerRequest | null>(null);
  const [editCounseling, setEditCounseling] = useState<CounselingRequest | null>(null);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<string>(PRAYER_TYPES[0]);
  const [formStatus, setFormStatus] = useState<string>(PRAYER_STATUSES[0]);
  const [formCounselingType, setFormCounselingType] = useState<string>(COUNSELING_TYPES[0]);
  const [formCounselingStatus, setFormCounselingStatus] = useState<string>(COUNSELING_STATUSES[0]);
  const [formUrgency, setFormUrgency] = useState<string>(URGENCY_LEVELS[1]);
  const [formDescription, setFormDescription] = useState('');
  const [formConfidential, setFormConfidential] = useState(false);
  const [formAssignedTo, setFormAssignedTo] = useState('');
  const [formError, setFormError] = useState('');

  const filteredPrayers = useMemo(() => {
    let list = [...prayers];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((p) => p.prayerType === typeFilter);
    if (statusFilter) list = list.filter((p) => p.status === statusFilter);
    return list;
  }, [prayers, search, typeFilter, statusFilter]);

  const filteredCounseling = useMemo(() => {
    let list = [...counseling];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    if (typeFilter) list = list.filter((c) => c.counselingType === typeFilter);
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [counseling, search, typeFilter, statusFilter]);

  const prayerStats = useMemo(() => ({
    total: prayers.length,
    answered: prayers.filter((p) => p.status === 'ANSWERED').length,
    pending: prayers.filter((p) => p.status === 'PENDING').length,
    confidential: prayers.filter((p) => p.isConfidential).length,
  }), [prayers]);

  const counselingStats = useMemo(() => ({
    total: counseling.length,
    resolved: counseling.filter((c) => c.status === 'RESOLVED').length,
    pending: counseling.filter((c) => c.status === 'PENDING').length,
    urgent: counseling.filter((c) => c.urgency === 'URGENT').length,
  }), [counseling]);

  const resetForm = () => {
    setFormName('');
    setFormType(PRAYER_TYPES[0]);
    setFormStatus(PRAYER_STATUSES[0]);
    setFormCounselingType(COUNSELING_TYPES[0]);
    setFormCounselingStatus(COUNSELING_STATUSES[0]);
    setFormUrgency(URGENCY_LEVELS[1]);
    setFormDescription('');
    setFormConfidential(false);
    setFormAssignedTo('');
    setFormError('');
    setEditPrayer(null);
    setEditCounseling(null);
    setShowCreate(false);
  };

  const handleCreatePrayer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Name and description are required');
      return;
    }
    const newPrayer: PrayerRequest = {
      id: `PR${Date.now()}`,
      name: formName.trim(),
      prayerType: formType as PrayerType,
      status: formStatus as PrayerStatus,
      date: new Date().toISOString().split('T')[0],
      isConfidential: formConfidential,
      description: formDescription.trim(),
      submittedBy: editPrayer ? editPrayer.submittedBy : formName.trim(),
    };
    if (editPrayer) {
      setPrayers((prev) => prev.map((p) => (p.id === editPrayer.id ? newPrayer : p)));
    } else {
      setPrayers((prev) => [newPrayer, ...prev]);
    }
    resetForm();
  };

  const handleCreateCounseling = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formName.trim() || !formDescription.trim()) {
      setFormError('Name and description are required');
      return;
    }
    const newCounseling: CounselingRequest = {
      id: `CR${Date.now()}`,
      name: formName.trim(),
      counselingType: formCounselingType as CounselingType,
      urgency: formUrgency as Urgency,
      status: formCounselingStatus as CounselingStatus,
      date: new Date().toISOString().split('T')[0],
      description: formDescription.trim(),
      submittedBy: editCounseling ? editCounseling.submittedBy : formName.trim(),
      assignedTo: formAssignedTo.trim() || undefined,
    };
    if (editCounseling) {
      setCounseling((prev) => prev.map((c) => (c.id === editCounseling.id ? newCounseling : c)));
    } else {
      setCounseling((prev) => [newCounseling, ...prev]);
    }
    resetForm();
  };

  const openPrayerForm = (prayer?: PrayerRequest) => {
    if (prayer) {
      setEditPrayer(prayer);
      setFormName(prayer.name);
      setFormType(prayer.prayerType);
      setFormStatus(prayer.status);
      setFormDescription(prayer.description);
      setFormConfidential(prayer.isConfidential);
      setFormCounselingType(COUNSELING_TYPES[0]);
      setFormUrgency(URGENCY_LEVELS[1]);
      setFormAssignedTo('');
    } else {
      resetForm();
      setFormType(PRAYER_TYPES[0]);
      setFormStatus(PRAYER_STATUSES[0]);
    }
    setShowCreate(true);
  };

  const openCounselingForm = (c?: CounselingRequest) => {
    if (c) {
      setEditCounseling(c);
      setFormName(c.name);
      setFormCounselingType(c.counselingType);
      setFormCounselingStatus(c.status);
      setFormUrgency(c.urgency);
      setFormDescription(c.description);
      setFormAssignedTo(c.assignedTo || '');
      setFormType(PRAYER_TYPES[0]);
      setFormStatus(PRAYER_STATUSES[0]);
      setFormConfidential(false);
    } else {
      resetForm();
      setFormCounselingType(COUNSELING_TYPES[0]);
      setFormCounselingStatus(COUNSELING_STATUSES[0]);
      setFormUrgency(URGENCY_LEVELS[1]);
    }
    setShowCreate(true);
  };

  const updatePrayerStatus = (id: string, status: PrayerStatus) => {
    setPrayers((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  const updateCounselingStatus = (id: string, status: CounselingStatus) => {
    setCounseling((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const assignCounselor = (id: string, name: string) => {
    setCounseling((prev) =>
      prev.map((c) => (c.id === id ? { ...c, assignedTo: name, status: c.status === 'PENDING' ? 'IN_PROGRESS' as CounselingStatus : c.status } : c))
    );
  };

  const deletePrayer = (id: string) => {
    if (window.confirm('Delete this prayer request?')) {
      setPrayers((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const deleteCounseling = (id: string) => {
    if (window.confirm('Delete this counseling request?')) {
      setCounseling((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sda-blue/10 rounded-xl">
            <HandHeart size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Prayer & Counseling</h1>
            <p className="text-[10px] text-slate-400 font-medium">Manage prayer requests and counseling sessions</p>
          </div>
        </div>
        <button
          onClick={() => { resetForm(); setShowCreate(!showCreate); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
        >
          {showCreate ? <X size={15} /> : <Plus size={15} />}
          {showCreate ? 'Cancel' : `New ${activeTab === 'prayer' ? 'Prayer' : 'Counseling'} Request`}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button onClick={() => { setActiveTab('prayer'); setShowCreate(false); }} className={STYLE.tab(activeTab === 'prayer')}>
          <span className="flex items-center gap-2">
            <Cross size={14} />
            Prayer Requests
            <span className="text-[9px] opacity-60">({prayers.length})</span>
          </span>
        </button>
        <button onClick={() => { setActiveTab('counseling'); setShowCreate(false); }} className={STYLE.tab(activeTab === 'counseling')}>
          <span className="flex items-center gap-2">
            <UserCheck size={14} />
            Counseling Requests
            <span className="text-[9px] opacity-60">({counseling.length})</span>
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      {activeTab === 'prayer' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
              <Cross size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{prayerStats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/30 shrink-0">
              <Clock size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{prayerStats.pending}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/30 shrink-0">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{prayerStats.answered}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Answered</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-950/30 shrink-0">
              <EyeOff size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{prayerStats.confidential}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Confidential</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
              <UserCheck size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{counselingStats.total}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/30 shrink-0">
              <Clock size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{counselingStats.pending}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Pending</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/30 shrink-0">
              <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{counselingStats.resolved}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Resolved</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/30 shrink-0">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{counselingStats.urgent}</p>
              <p className="text-[10px] font-bold text-slate-400 mt-0.5">Urgent</p>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreate && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">
            {editPrayer || editCounseling ? 'Edit' : 'New'} {activeTab === 'prayer' ? 'Prayer Request' : 'Counseling Request'}
          </h3>
          <form onSubmit={activeTab === 'prayer' ? handleCreatePrayer : handleCreateCounseling} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={STYLE.label}>Name</label>
                <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={STYLE.input} placeholder="Requester name..." />
              </div>
              {activeTab === 'prayer' ? (
                <>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Prayer Type</label>
                    <select value={formType} onChange={(e) => setFormType(e.target.value)} className={STYLE.select}>
                      {PRAYER_TYPES.map((t) => <option key={t} value={t}>{PRAYER_TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Status</label>
                    <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className={STYLE.select}>
                      {PRAYER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id="confidential" checked={formConfidential} onChange={(e) => setFormConfidential(e.target.checked)} className="rounded border-slate-300 dark:border-slate-600" />
                    <label htmlFor="confidential" className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Mark as Confidential</label>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Counseling Type</label>
                    <select value={formCounselingType} onChange={(e) => setFormCounselingType(e.target.value)} className={STYLE.select}>
                      {COUNSELING_TYPES.map((t) => <option key={t} value={t}>{COUNSELING_TYPE_LABELS[t]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Urgency</label>
                    <select value={formUrgency} onChange={(e) => setFormUrgency(e.target.value)} className={STYLE.select}>
                      {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Status</label>
                    <select value={formCounselingStatus} onChange={(e) => setFormCounselingStatus(e.target.value)} className={STYLE.select}>
                      {COUNSELING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={STYLE.label}>Assigned To</label>
                    <input type="text" value={formAssignedTo} onChange={(e) => setFormAssignedTo(e.target.value)} className={STYLE.input} placeholder="Counselor name..." />
                  </div>
                </>
              )}
            </div>
            <div className="space-y-1.5">
              <label className={STYLE.label}>Description</label>
              <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
                placeholder="Describe the request..." />
            </div>
            {formError && (
              <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {formError}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={resetForm} className={STYLE.btn('ghost')}>Cancel</button>
              <button type="submit" className={STYLE.btn('primary')}>
                {editPrayer || editCounseling ? 'Update' : 'Create'} {activeTab === 'prayer' ? 'Prayer Request' : 'Counseling Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeTab === 'prayer' ? 'prayer' : 'counseling'} requests...`}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold transition-all ${
            showFilters ? 'bg-sda-blue text-white border-sda-blue' : 'border-slate-200 dark:border-slate-700 text-slate-500'
          }`}>
          <Filter size={14} /> Filters
        </button>
        {(search || typeFilter || statusFilter) && (
          <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all">
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="space-y-1">
            <label className={STYLE.label}>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40">
              <option value="">All Types</option>
              {(activeTab === 'prayer' ? PRAYER_TYPES : COUNSELING_TYPES).map((t) => (
                <option key={t} value={t}>{activeTab === 'prayer' ? PRAYER_TYPE_LABELS[t] : COUNSELING_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className={STYLE.label}>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40">
              <option value="">All Statuses</option>
              {(activeTab === 'prayer' ? PRAYER_STATUSES : COUNSELING_STATUSES).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Prayer Requests List */}
      {activeTab === 'prayer' && (
        <>
          {filteredPrayers.length === 0 ? (
            <div className="text-center py-16">
              <Cross size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs font-bold text-slate-400">No prayer requests found</p>
              <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPrayers.map((prayer) => (
                <div key={prayer.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={STYLE.badge(STATUS_PRAYER_COLORS[prayer.status])}>{prayer.status}</span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {PRAYER_TYPE_LABELS[prayer.prayerType]}
                        </span>
                        {prayer.isConfidential && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400">
                            <EyeOff size={10} /> Confidential
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{prayer.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{prayer.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {prayer.submittedBy} &middot; {new Date(prayer.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {prayer.status !== 'ANSWERED' && prayer.status !== 'CLOSED' && (
                        <button onClick={() => updatePrayerStatus(prayer.id, 'ANSWERED')}
                          className="p-2 rounded-xl text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all" title="Mark Answered">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => openPrayerForm(prayer)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Edit">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => deletePrayer(prayer.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all" title="Delete">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Counseling Requests List */}
      {activeTab === 'counseling' && (
        <>
          {filteredCounseling.length === 0 ? (
            <div className="text-center py-16">
              <UserCheck size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs font-bold text-slate-400">No counseling requests found</p>
              <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCounseling.map((c) => (
                <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={STYLE.badge(STATUS_COUNSELING_COLORS[c.status])}>{c.status}</span>
                        <span className={STYLE.badge(URGENCY_COLORS[c.urgency])}>
                          {URGENCY_ICONS[c.urgency]} {c.urgency === 'URGENT' ? 'URGENT' : c.urgency}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          {COUNSELING_TYPE_LABELS[c.counselingType]}
                        </span>
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-white">{c.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{c.description}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        {c.submittedBy} &middot; {new Date(c.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {c.assignedTo && <span> &middot; Assigned to: {c.assignedTo}</span>}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {c.status === 'PENDING' && (
                        <button onClick={() => { const name = window.prompt('Assign counselor name:'); if (name) assignCounselor(c.id, name); }}
                          className="p-2 rounded-xl text-sda-blue hover:bg-sda-blue/10 dark:hover:bg-sda-blue/20 transition-all" title="Assign Counselor">
                          <UserCheck size={14} />
                        </button>
                      )}
                      {c.status !== 'RESOLVED' && c.status !== 'CLOSED' && (
                        <button onClick={() => updateCounselingStatus(c.id, 'RESOLVED')}
                          className="p-2 rounded-xl text-green-500 hover:bg-green-50 dark:hover:bg-green-950/20 transition-all" title="Mark Resolved">
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button onClick={() => openCounselingForm(c)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" title="Edit">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => deleteCounseling(c.id)}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all" title="Delete">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrayerCounselingPage;
