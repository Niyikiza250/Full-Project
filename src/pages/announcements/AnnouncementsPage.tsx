import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useMarkAnnouncementRead,
  useDeleteAnnouncement,
} from '@/hooks/useCommunicationModule';
import { getTargetRolesForSender, ROLE_LABELS } from '@/utils/announcementPermissions';
import type { AnnouncementPriority, AnnouncementCategory } from '@/types/communication';
import type { UserRole } from '@/constants/routes';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  X,
  Send,
  Trash2,
  ChevronDown,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  CalendarDays,
} from 'lucide-react';

const PRIORITY_COLORS: Record<string, string> = {
  URGENT: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  HIGH: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  NORMAL: 'bg-sda-blue/10 text-sda-blue dark:bg-sda-blue/20 dark:text-sda-gold',
  LOW: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
};

const PRIORITY_ICONS: Record<string, React.ReactNode> = {
  URGENT: <AlertTriangle size={12} />,
  HIGH: <Info size={12} />,
  NORMAL: <CheckCircle size={12} />,
  LOW: <Clock size={12} />,
};

const CATEGORIES: AnnouncementCategory[] = ['GENERAL', 'TRAINING', 'SPIRITUAL', 'FINANCE', 'YOUTH'];

const AnnouncementsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { data: announcements, isLoading } = useAnnouncements();
  const createAnnouncement = useCreateAnnouncement();
  const markRead = useMarkAnnouncementRead();
  const deleteAnnouncement = useDeleteAnnouncement();

  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [senderFilter, setSenderFilter] = useState<string>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formPriority, setFormPriority] = useState<AnnouncementPriority>('NORMAL');
  const [formCategory, setFormCategory] = useState<AnnouncementCategory>('GENERAL');
  const [formTargetRole, setFormTargetRole] = useState<UserRole | ''>('');
  const [formError, setFormError] = useState('');

  if (!user) return null;
  const canCreate = getTargetRolesForSender(user.role as UserRole).length > 0;
  const targetOptions = canCreate ? getTargetRolesForSender(user.role as UserRole) : [];

  const filtered = (announcements || []).filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (priorityFilter && a.priority !== priorityFilter) return false;
    if (senderFilter && a.authorRole !== senderFilter) return false;
    return true;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!formTitle.trim() || !formBody.trim()) {
      setFormError('Title and body are required');
      return;
    }
    if (!formTargetRole) {
      setFormError('Please select a target audience');
      return;
    }
    try {
      await createAnnouncement.mutateAsync({
        title: formTitle,
        body: formBody,
        priority: formPriority,
        category: formCategory,
        targetRole: formTargetRole as UserRole,
      });
      setFormTitle('');
      setFormBody('');
      setFormPriority('NORMAL');
      setFormCategory('GENERAL');
      setFormTargetRole('');
      setShowCreate(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create announcement');
    }
  };

  const handleMarkRead = (id: string) => {
    markRead.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      deleteAnnouncement.mutate(id);
    }
  };

  const senderRoles = [...new Set((announcements || []).map((a) => a.authorRole))];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sda-blue/10 rounded-xl">
            <Megaphone size={22} className="text-sda-blue dark:text-sda-gold" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-slate-800 dark:text-white">Announcements</h1>
            <p className="text-[10px] text-slate-400 font-medium">Manage and view all announcements</p>
          </div>
        </div>
        {canCreate && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all shadow-sm"
          >
            <Plus size={15} />
            {showCreate ? 'Cancel' : 'New Announcement'}
          </button>
        )}
      </div>

      {/* Compact KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/30 shrink-0">
            <Megaphone size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{announcements?.length || 0}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Total</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 dark:bg-orange-950/30 shrink-0">
            <AlertTriangle size={16} className="text-orange-500 dark:text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{(announcements || []).filter((a) => !a.isRead).length}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Unread</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-100 dark:bg-green-950/30 shrink-0">
            <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-lg font-extrabold text-slate-800 dark:text-white leading-none">{(announcements || []).filter((a) => a.isRead).length}</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">Read</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
                placeholder="Announcement title..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Audience</label>
              <select
                value={formTargetRole}
                onChange={(e) => setFormTargetRole(e.target.value as UserRole)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              >
                <option value="">Select target...</option>
                {targetOptions.map((opt, i) => (
                  <option key={i} value={opt.roles[0]}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value as AnnouncementPriority)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as AnnouncementCategory)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0) + cat.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
            <textarea
              value={formBody}
              onChange={(e) => setFormBody(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40 resize-none"
              placeholder="Write your announcement..."
            />
          </div>
          {formError && (
            <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {formError}
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createAnnouncement.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-sda-blue text-white rounded-xl text-xs font-bold hover:bg-sda-blue-dark transition-all disabled:opacity-50"
            >
              <Send size={14} />
              {createAnnouncement.isPending ? 'Sending...' : 'Send Announcement'}
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search announcements..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
          <select
            value={senderFilter}
            onChange={(e) => setSenderFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sda-blue/40"
          >
            <option value="">All Senders</option>
            {senderRoles.map((role) => (
              <option key={role} value={role}>{ROLE_LABELS[role as UserRole] || role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Announcement List */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">Loading announcements...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Megaphone size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
          <p className="text-xs font-bold text-slate-400">No announcements found</p>
          <p className="text-[10px] text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((announcement) => {
            const isExpanded = expandedId === announcement.id;
            const isSender = announcement.authorRole === user.role;
            return (
              <div
                key={announcement.id}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs hover:shadow-sm transition-all cursor-pointer ${!announcement.isRead ? 'border-l-4 border-l-sda-blue dark:border-l-sda-gold' : ''}`}
                onClick={() => {
                  if (!isExpanded) {
                    setExpandedId(announcement.id);
                    if (!announcement.isRead) handleMarkRead(announcement.id);
                  } else {
                    setExpandedId(null);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold ${PRIORITY_COLORS[announcement.priority] || PRIORITY_COLORS.NORMAL}`}>
                        {PRIORITY_ICONS[announcement.priority]}
                        {announcement.priority}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {ROLE_LABELS[announcement.authorRole as UserRole] || announcement.authorRole}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        To: {ROLE_LABELS[announcement.targetRole as UserRole] || announcement.targetRole}
                      </span>
                      {!announcement.isRead && (
                        <span className="w-1.5 h-1.5 rounded-full bg-sda-blue dark:bg-sda-gold" />
                      )}
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800 dark:text-white truncate">
                      {announcement.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      {announcement.author} &middot; {new Date(announcement.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isSender && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(announcement.id); }}
                        className="p-2 rounded-xl text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {announcement.body}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[9px] text-slate-400 font-medium">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={11} />
                        {new Date(announcement.publishedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        {announcement.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default AnnouncementsPage;
