import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import {
  useHierarchicalAnnouncements,
  useCreateAnnouncement,
  useBulletin,
  useInternalMessages,
  useSmsTemplates,
  useMarkMessageRead,
  useSendInternalMessage,
} from '@/hooks/useCommunicationModule';
import { MOCK_SYSTEM_NOTIFICATIONS } from '@/data/enterpriseMocks';
import { useNotificationReadStore } from '@/store/useNotificationReadStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { cn } from '@/lib/utils';
import {
  Bell,
  Megaphone,
  Pin,
  Send,
  Smartphone,
  Search,
  Plus,
  X,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  Calendar,
  Paperclip,
  Trash2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import type { AnnouncementCategory, AnnouncementPriority, Attachment } from '@/types/communication';

type Tab = 'announcements' | 'bulletin' | 'messages' | 'sms' | 'notifications';

const CommunicationHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const [tab, setTab] = useState<Tab>('announcements');
  
  // Data loading hooks
  const { data: announcements, isLoading: la } = useHierarchicalAnnouncements();
  const { data: bulletin, isLoading: lb } = useBulletin();
  const { data: messages, isLoading: lm } = useInternalMessages();
  const { data: smsTemplates, isLoading: ls } = useSmsTemplates();
  
  const createAnnouncementMutation = useCreateAnnouncement();
  const markRead = useMarkMessageRead();
  const sendMsg = useSendInternalMessage();
  
  const { markRead: markN, markAllRead, isRead, markRead: markAnnouncementRead } = useNotificationReadStore();
  const { addToast } = useNotificationStore();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AnnouncementCategory>('GENERAL');
  const [newPriority, setNewPriority] = useState<AnnouncementPriority>('NORMAL');
  const [newBody, setNewBody] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [simulatedFiles] = useState([
    { name: 'Mission_Agenda_Q2.pdf', size: '1.4 MB', type: 'application/pdf' },
    { name: 'Finance_Report_2026.xlsx', size: '750 KB', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { name: 'Youth_Vespers_Schedule.png', size: '2.1 MB', type: 'image/png' }
  ]);

  const [compose, setCompose] = useState({ to: 'Treasury', subject: '', preview: '' });
  const [sms, setSms] = useState({ audience: 'Field Leaders', templateId: '', body: '' });

  React.useEffect(() => {
    if (!smsTemplates?.length) return;
    setSms((s) => {
      if (s.body) return s;
      const tpl = smsTemplates.find((x) => x.id === s.templateId) ?? smsTemplates[0];
      return { ...s, templateId: tpl.id, body: tpl.body };
    });
  }, [smsTemplates]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'announcements', label: t('communication.tabAnnouncements') },
    { id: 'bulletin', label: t('communication.tabBulletin') },
    { id: 'messages', label: t('communication.tabMessages') },
    { id: 'sms', label: t('communication.tabSms') },
    { id: 'notifications', label: t('communication.tabNotifications') },
  ];

  const unreadCount = MOCK_SYSTEM_NOTIFICATIONS.filter((n) => !isRead(n.id)).length;

  // Render Rich Text Markdown Mock Preview
  const parseMarkdownToHtml = (text: string) => {
    if (!text) return `<p class="text-slate-400 dark:text-slate-500 italic">${t('communication.richBody')} preview...</p>`;
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Headers
    html = html.replace(/^#\s+(.+)$/gm, '<h3 class="text-base font-bold text-slate-800 dark:text-white mt-3 mb-1">$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h4 class="text-sm font-bold text-slate-800 dark:text-white mt-2 mb-1">$1</h4>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Bullet Lists
    html = html.replace(/^\-\s+(.+)$/gm, '<li class="ml-4 list-disc text-xs text-slate-650 dark:text-slate-350">$1</li>');
    
    // Newlines
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  // Editor Actions
  const insertText = (tagOpen: string, tagClose: string) => {
    const textarea = document.getElementById('rich-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    const replacement = tagOpen + (selected || 'text') + tagClose;
    
    setNewBody(text.substring(0, start) + replacement + text.substring(end));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tagOpen.length, start + tagOpen.length + (selected || 'text').length);
    }, 50);
  };

  const handleSimulateAttachment = (file: typeof simulatedFiles[0]) => {
    if (attachments.find(a => a.name === file.name)) {
      addToast(t('communication.toasts.importantAlert'), t('communication.toasts.fileAlreadyAttached', { name: file.name }), 'WARNING');
      return;
    }
    setAttachments([...attachments, file]);
    addToast(t('communication.toasts.adminAction'), t('communication.toasts.fileAttached', { name: file.name }), 'SUCCESS');
  };

  const handleRemoveAttachment = (name: string) => {
    setAttachments(attachments.filter(a => a.name !== name));
  };

  const handlePublish = async () => {
    if (!newTitle.trim()) {
      addToast(t('communication.toasts.importantAlert'), t('communication.toasts.titleRequired'), 'ALERT');
      return;
    }
    if (!newBody.trim()) {
      addToast(t('communication.toasts.importantAlert'), t('communication.toasts.bodyRequired'), 'ALERT');
      return;
    }

    try {
      await createAnnouncementMutation.mutateAsync({
        title: newTitle,
        body: newBody,
        priority: newPriority,
        category: newCategory,
        scheduledAt: scheduledDate || undefined,
        attachments: attachments.length > 0 ? attachments : undefined
      });

      addToast(
        t('communication.toasts.newAnnouncement'),
        t('communication.toasts.announcementPublished', { title: newTitle }),
        newPriority === 'URGENT' ? 'ALERT' : newPriority === 'HIGH' ? 'WARNING' : 'SUCCESS'
      );

      setNewTitle('');
      setNewBody('');
      setNewCategory('GENERAL');
      setNewPriority('NORMAL');
      setScheduledDate('');
      setAttachments([]);
      setIsModalOpen(false);
    } catch (err) {
      addToast(t('communication.toasts.importantAlert'), t('communication.toasts.publishFailed'), 'ALERT');
    }
  };

  // Determine role-based create permissions
  const canCreate = user?.role === 'ADMIN';
  
  // Target audience label
  const getTargetAudienceLabel = () => {
    if (!user) return t('communication.audienceMembers');
    if (user.role === 'UNION_LEADER') return t('communication.audienceFieldLeaders');
    if (user.role === 'FIELD_LEADER') return t('communication.audienceZoneLeaders');
    if (user.role === 'ZONE_LEADER') return t('communication.audienceChurchLeaders');
    if (user.role === 'CHURCH_LEADER') return t('communication.audienceMembers');
    return t('communication.audienceAllAdmin');
  };

  // Filtered Announcements
  const filteredAnnouncements = announcements?.filter(a => {
    const matchesSearch = 
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.body.toLowerCase().includes(searchQuery.toLowerCase()) || 
      a.author.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || a.category === categoryFilter;
    const matchesPriority = priorityFilter === 'ALL' || a.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  }) || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader title={t('communication.title')} subtitle={t('communication.subtitle')} />

      {/* Tabs list with modern enterprise styled buttons */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setTab(x.id)}
            className={cn(
              'relative rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm',
              tab === x.id 
                ? 'bg-gradient-to-r from-sda-blue to-sda-blue-dark text-white shadow-md' 
                : 'text-slate-650 hover:bg-slate-100 hover:text-sda-blue dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-sda-gold-light'
            )}
          >
            {x.label}
            {x.id === 'notifications' && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] text-white font-extrabold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
        >
          {/* TAB 1: ANNOUNCEMENTS */}
          {tab === 'announcements' && (
            <div className="space-y-6">
              {/* Header and Create Button */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                    <Megaphone className="text-sda-blue dark:text-sda-gold shrink-0" size={18} />
                    {t('communication.announcementHistory')}
                  </h3>
                  <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">
                    {t('dashboard.welcome', { name: user?.name })}
                  </p>
                </div>
                {canCreate && (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-sda-blue to-sda-blue-dark hover:from-sda-blue-dark hover:to-sda-blue px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-sda-blue/15 hover:shadow-lg transition-all"
                  >
                    <Plus size={16} />
                    {t('communication.createAnnouncement')}
                  </button>
                )}
              </div>

              {/* Filtering Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Search */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-450">
                    <Search size={16} />
                  </span>
                  <input
                    type="text"
                    placeholder={t('communication.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold-light"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold-light"
                  >
                    <option value="ALL">{t('communication.filterCategory')}: {t('common.all')}</option>
                    <option value="SPIRITUAL">{t('communication.categorySpiritual')}</option>
                    <option value="TRAINING">{t('communication.categoryTraining')}</option>
                    <option value="FINANCE">{t('communication.categoryFinance')}</option>
                    <option value="YOUTH">{t('communication.categoryYouth')}</option>
                    <option value="GENERAL">{t('communication.categoryGeneral')}</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 px-3 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sda-blue dark:focus:ring-sda-gold-light"
                  >
                    <option value="ALL">{t('communication.filterPriority')}: {t('common.all')}</option>
                    <option value="LOW">{t('communication.priorityLow')}</option>
                    <option value="NORMAL">{t('communication.priorityNormal')}</option>
                    <option value="HIGH">{t('communication.priorityHigh')}</option>
                    <option value="URGENT">{t('communication.priorityUrgent')}</option>
                  </select>
                </div>
              </div>

              {/* List */}
              {la || !announcements ? (
                <LoadingBlock />
              ) : filteredAnnouncements.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                  <Megaphone className="mx-auto text-slate-400 mb-3" size={32} />
                  <p className="text-sm font-semibold text-slate-650 dark:text-slate-450">
                    {t('communication.noAnnouncements')}
                  </p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {filteredAnnouncements.map((a) => {
                    const isUnread = !isRead(a.id);
                    return (
                      <li
                        key={a.id}
                        onClick={() => markAnnouncementRead(a.id)}
                        className={cn(
                          'rounded-2xl border p-5 transition-all relative overflow-hidden cursor-pointer',
                          isUnread
                            ? 'border-sda-blue/30 dark:border-sda-gold/25 bg-gradient-to-br from-sda-blue/5 to-transparent dark:from-sda-gold/5'
                            : 'border-slate-150 dark:border-slate-850 hover:bg-slate-50/30 dark:hover:bg-slate-800/20'
                        )}
                      >
                        {/* Unread indicator */}
                        {isUnread && (
                          <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-sda-blue dark:bg-sda-gold animate-pulse" />
                        )}

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {/* Priority Badge */}
                          <span className={cn(
                            'rounded-lg px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide',
                            a.priority === 'URGENT' ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400' :
                            a.priority === 'HIGH' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' :
                            a.priority === 'NORMAL' ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400' :
                            'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                          )}>
                            {t(`communication.priority${a.priority.charAt(0) + a.priority.slice(1).toLowerCase()}`)}
                          </span>

                          {/* Category Badge */}
                          <span className="rounded-lg bg-slate-100 dark:bg-slate-850 px-2.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-500 tracking-wide">
                            {t(`communication.category${a.category.charAt(0) + a.category.slice(1).toLowerCase()}`)}
                          </span>

                          {/* Scheduled Indicator */}
                          {a.scheduledAt && (
                            <span className="rounded-lg bg-purple-100 dark:bg-purple-950/40 text-purple-750 dark:text-purple-400 px-2.5 py-0.5 text-[9px] font-extrabold flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(a.scheduledAt).toLocaleString()}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-850 dark:text-white leading-tight">
                          {a.title}
                        </h4>

                        {/* Parsed Body Preview */}
                        <div
                          className="mt-2.5 text-xs sm:text-sm text-slate-650 dark:text-slate-350 leading-relaxed font-medium space-y-1.5"
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(a.body) }}
                        />

                        {/* Attachments UI */}
                        {a.attachments && a.attachments.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                            {a.attachments.map((file, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToast(t('communication.toasts.adminAction'), t('communication.toasts.downloading', { name: file.name, size: file.size }), 'SUCCESS');
                                }}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-650 dark:text-slate-350 transition-colors"
                              >
                                <FileText size={13} className="text-sda-blue dark:text-sda-gold" />
                                <span>{file.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold">({file.size})</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Footer Information */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center text-[10px] sm:text-xs text-slate-450 font-semibold gap-2">
                          <div>
                            {a.author} ({getTranslatedRoleLabel(a.authorRole, t)})
                          </div>
                          <div>
                            {new Date(a.publishedAt).toLocaleString()} · {t('communication.audience')}: {a.audience}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {/* TAB 2: BULLETIN */}
          {tab === 'bulletin' &&
            (lb || !bulletin ? (
              <LoadingBlock />
            ) : (
              <ul className="space-y-3">
                {bulletin.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-4 dark:border-slate-800 hover:bg-slate-50/20 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    {b.pinned && <Pin className="mt-0.5 shrink-0 text-sda-blue dark:text-sda-gold" size={18} aria-hidden />}
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{b.title}</p>
                      <p className="text-sm text-slate-550 dark:text-slate-400 mt-1">{b.excerpt}</p>
                      <p className="mt-2 text-xs text-slate-400 font-semibold">
                        {b.category} · {new Date(b.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ))}

          {/* TAB 3: INTERNAL MESSAGES */}
          {tab === 'messages' &&
            (lm || !messages ? (
              <LoadingBlock />
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <ul className="space-y-2">
                  {messages.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => !m.read && markRead.mutate(m.id)}
                        className={cn(
                          'w-full rounded-2xl border px-4 py-3.5 text-left text-sm transition-all',
                          m.read
                            ? 'border-slate-100 bg-slate-50/40 dark:border-slate-850 dark:bg-slate-800/10 text-slate-700 dark:text-slate-350'
                            : 'border-sda-blue/30 bg-sda-blue/5 text-slate-900 dark:text-white dark:border-sda-gold/20'
                        )}
                      >
                        <p className="font-bold">{m.subject}</p>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                          {m.fromName} → {m.toName}
                        </p>
                        <p className="mt-2 line-clamp-2 text-xs text-slate-650 dark:text-slate-400">{m.preview}</p>
                        <span className="mt-2.5 inline-block text-[9px] font-black uppercase text-slate-400 tracking-wider">
                          {m.read ? t('common.read') : t('common.unread')}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
                  <h3 className="font-bold text-slate-800 dark:text-white">{t('communication.compose')}</h3>
                  <div className="mt-3.5 space-y-3">
                    <input
                      placeholder={t('communication.to')}
                      value={compose.to}
                      onChange={(e) => setCompose((c) => ({ ...c, to: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sda-blue"
                    />
                    <input
                      placeholder={t('communication.subject')}
                      value={compose.subject}
                      onChange={(e) => setCompose((c) => ({ ...c, subject: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sda-blue"
                    />
                    <textarea
                      placeholder={t('communication.preview')}
                      rows={4}
                      value={compose.preview}
                      onChange={(e) => setCompose((c) => ({ ...c, preview: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-semibold dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sda-blue"
                    />
                    <button
                      type="button"
                      disabled={sendMsg.isPending}
                      onClick={async () => {
                        await sendMsg.mutateAsync({
                          toName: compose.to,
                          subject: compose.subject || t('communication.noSubject'),
                          preview: compose.preview,
                        });
                        addToast(t('communication.toasts.adminAction'), t('communication.toasts.messageSent'), 'SUCCESS');
                        setCompose({ to: compose.to, subject: '', preview: '' });
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sda-blue to-sda-blue-dark py-2.5 text-xs font-bold text-white disabled:opacity-50 shadow-md hover:shadow-lg transition-all"
                    >
                      <Send size={14} aria-hidden />
                      {t('communication.send')}
                    </button>
                  </div>
                </div>
              </div>
            ))}

          {/* TAB 4: SMS */}
          {tab === 'sms' &&
            (ls || !smsTemplates ? (
              <LoadingBlock />
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-850 dark:text-white">
                    <Smartphone className="text-sda-blue dark:text-sda-gold" size={20} aria-hidden />
                    {t('communication.smsComposer')}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed font-semibold">{t('communication.smsHint')}</p>
                  
                  <label className="mt-4 block text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('communication.audience')}</label>
                  <input
                    value={sms.audience}
                    onChange={(e) => setSms((s) => ({ ...s, audience: e.target.value }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-sda-blue"
                  />
                  
                  <label className="mt-3.5 block text-[10px] font-black uppercase text-slate-500 tracking-wider">{t('communication.template')}</label>
                  <select
                    value={sms.templateId}
                    onChange={(e) => {
                      const tpl = smsTemplates.find((x) => x.id === e.target.value);
                      setSms((s) => ({ ...s, templateId: e.target.value, body: tpl?.body ?? '' }));
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-bold dark:border-slate-800 dark:bg-slate-950 focus:outline-none"
                  >
                    {smsTemplates.map((tpl) => (
                      <option key={tpl.id} value={tpl.id}>
                        {tpl.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">{t('communication.smsPreview')}</label>
                  <textarea
                    rows={8}
                    value={sms.body}
                    onChange={(e) => setSms((s) => ({ ...s, body: e.target.value }))}
                    className="mt-1 w-full rounded-2xl border border-slate-250 bg-slate-50/50 p-4 font-mono text-xs leading-normal dark:border-slate-800 dark:bg-slate-955 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sda-blue"
                  />
                  <button
                    type="button"
                    onClick={() => addToast(t('communication.toasts.adminAction'), t('communication.toasts.smsSent'), 'SUCCESS')}
                    className="mt-3.5 w-full rounded-xl border border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40 py-2.5 text-xs font-bold dark:border-slate-800 transition-colors"
                  >
                    {t('communication.smsSendButton')}
                  </button>
                </div>
              </div>
            ))}

          {/* TAB 5: SYSTEM NOTIFICATIONS */}
          {tab === 'notifications' && (
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="flex items-center gap-2 font-bold text-slate-850 dark:text-white">
                  <Bell size={18} className="text-sda-blue dark:text-sda-gold" aria-hidden />
                  {t('communication.tabNotifications')}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    markAllRead(MOCK_SYSTEM_NOTIFICATIONS.map((n) => n.id));
                    addToast(t('communication.toasts.adminAction'), t('communication.toasts.allCleared'), 'SUCCESS');
                  }}
                  className="text-xs font-bold text-sda-blue dark:text-sda-gold-light hover:underline"
                >
                  {t('communication.markAllRead')}
                </button>
              </div>
              <ul className="space-y-2">
                {MOCK_SYSTEM_NOTIFICATIONS.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => markN(n.id)}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-all',
                        isRead(n.id) ? 'border-slate-100 opacity-60 dark:border-slate-850' : 'border-sda-blue/30 bg-sda-blue/5 dark:border-sda-gold/25'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1 h-2.5 w-2.5 shrink-0 rounded-full',
                          n.type === 'WARNING' && 'bg-amber-500',
                          n.type === 'SUCCESS' && 'bg-green-500',
                          n.type === 'INFO' && 'bg-sda-blue',
                          n.type === 'ALERT' && 'bg-red-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-850 dark:text-white leading-snug">{n.title}</p>
                        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">{n.body}</p>
                        <p className="mt-2 text-[9px] text-slate-400 font-extrabold tracking-wide uppercase">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {unreadCount === 0 && <p className="mt-6 text-center text-xs text-slate-500 font-bold">{t('communication.noNotifications')}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CREATE ANNOUNCEMENT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col z-10"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-950 dark:text-white">
                    {t('communication.createAnnouncement')}
                  </h3>
                  <p className="text-[10px] sm:text-xs font-bold text-sda-blue dark:text-sda-gold-light mt-0.5">
                    {t('communication.audience')}: {getTargetAudienceLabel()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-left">
                {/* Title */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    {t('communication.announcementTitle')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('communication.announcementTitlePlaceholder')}
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 px-3.5 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-sda-blue"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                      {t('communication.announcementCategory')}
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as AnnouncementCategory)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="GENERAL">{t('communication.categoryGeneral')}</option>
                      <option value="SPIRITUAL">{t('communication.categorySpiritual')}</option>
                      <option value="TRAINING">{t('communication.categoryTraining')}</option>
                      <option value="FINANCE">{t('communication.categoryFinance')}</option>
                      <option value="YOUTH">{t('communication.categoryYouth')}</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                      {t('communication.announcementPriority')}
                    </label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as AnnouncementPriority)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2.5 text-xs font-bold focus:outline-none"
                    >
                      <option value="NORMAL">{t('communication.priorityNormal')}</option>
                      <option value="LOW">{t('communication.priorityLow')}</option>
                      <option value="HIGH">{t('communication.priorityHigh')}</option>
                      <option value="URGENT">{t('communication.priorityUrgent')}</option>
                    </select>
                  </div>
                </div>

                {/* Scheduled Publish Date */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {t('communication.scheduledTime')}
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/20 px-3.5 py-2.5 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Simulated Attachments */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5 flex items-center gap-1.5">
                    <Paperclip size={13} />
                    {t('communication.attachmentsSimulated')}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {simulatedFiles.map((file, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSimulateAttachment(file)}
                        className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl px-2.5 py-1.5 text-[10px] font-bold border border-slate-200 dark:border-slate-800"
                      >
                        <Plus size={11} />
                        <span>{file.name}</span>
                      </button>
                    ))}
                  </div>

                  {attachments.length > 0 && (
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800/60 p-3 space-y-1.5 bg-slate-50/30 dark:bg-slate-900/35">
                      {attachments.map((file, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-650 dark:text-slate-350">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-sda-blue dark:text-sda-gold" />
                            <span>{file.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">({file.size})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(file.name)}
                            className="text-red-500 hover:text-red-700"
                            title={t('communication.removeAttachment')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Rich Mock Text Editor */}
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                    {t('communication.richBody')}
                  </label>
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col bg-white dark:bg-slate-950">
                    {/* Formatting Toolbar */}
                    <div className="flex gap-1 p-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => insertText('**', '**')}
                        className="p-1.5 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-colors"
                        title={t('communication.formatBold')}
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('*', '*')}
                        className="p-1.5 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-colors"
                        title={t('communication.formatItalic')}
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('# ', '')}
                        className="p-1.5 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-colors"
                        title={t('communication.formatH1')}
                      >
                        <Heading1 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('## ', '')}
                        className="p-1.5 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-colors"
                        title={t('communication.formatH2')}
                      >
                        <Heading2 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertText('- ', '')}
                        className="p-1.5 rounded-lg text-slate-650 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-slate-900 transition-colors"
                        title={t('communication.formatBulletList')}
                      >
                        <List size={14} />
                      </button>
                    </div>

                    {/* Editor Textarea and Live Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                      {/* Editor Textarea */}
                      <textarea
                        id="rich-editor-textarea"
                        required
                        rows={6}
                        placeholder={t('communication.editorBodyPlaceholder')}
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        className="p-4 text-xs sm:text-sm font-semibold text-slate-700 bg-white dark:bg-slate-950 dark:text-slate-300 focus:outline-none resize-none overflow-y-auto custom-scrollbar"
                      />

                      {/* Real-time Preview */}
                      <div className="p-4 bg-slate-50/30 dark:bg-slate-900/10 min-h-[150px] overflow-y-auto max-h-[250px] text-left custom-scrollbar">
                        <span className="text-[9px] font-black uppercase text-slate-400 block mb-2 tracking-wider">
                          {t('communication.livePreview')}
                        </span>
                        <div
                          className="prose dark:prose-invert prose-xs text-slate-800 dark:text-slate-200 leading-normal"
                          dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(newBody) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addToast(t('communication.toasts.adminAction'), t('communication.toasts.draftSaved'), 'SUCCESS');
                    setIsModalOpen(false);
                  }}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-250 dark:hover:bg-slate-750 transition-colors"
                >
                  {t('communication.saveDraft')}
                </button>
                <button
                  type="button"
                  disabled={createAnnouncementMutation.isPending}
                  onClick={handlePublish}
                  className="rounded-xl bg-gradient-to-r from-sda-blue to-sda-blue-dark py-2.5 px-4 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  {createAnnouncementMutation.isPending && (
                    <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin shrink-0" />
                  )}
                  {t('communication.publish')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommunicationHub;
