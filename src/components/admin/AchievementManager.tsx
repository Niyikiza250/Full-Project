import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';
import { usePhotoStore } from '@/store/usePhotoStore';
import { saveAchievementImage } from '@/api/achievementStorage';
import { localizeAchievement } from '@/lib/achievementLocalization';
import { Trophy, Plus, Pencil, Trash2, X, ImageUp, CheckCircle2, Clock, Check, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { AchievementKind, AchievementItem, AchievementStatus } from '@/types/achievement';

const KINDS: AchievementKind[] = ['STORY', 'GALLERY', 'MILESTONE', 'TESTIMONY', 'NEWS'];

const kindLabelKey: Record<AchievementKind, string> = {
  STORY: 'achievements.story',
  GALLERY: 'achievements.gallery',
  MILESTONE: 'achievements.milestone',
  TESTIMONY: 'achievements.testimony',
  NEWS: 'achievements.news',
};

const emptyForm = {
  kind: 'STORY' as AchievementKind,
  title: '',
  summary: '',
  coverUrl: '',
  author: '',
  tags: '',
  galleryUrls: '',
};

export const AchievementManager: React.FC = () => {
  const { t } = useTranslation();
  const { items, addItem, updateItem, deleteItem, approveItem, rejectItem } = useAchievementAdminStore();
  const { photos, addPhoto } = usePhotoStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<AchievementStatus | 'ALL'>('ALL');

  const statusConfig: Record<AchievementStatus, { label: string; bg: string; icon: React.ReactNode }> = {
    PENDING: {
      label: t('achievements.statusPending'),
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      icon: <Clock size={10} />,
    },
    APPROVED: {
      label: t('achievements.statusApproved'),
      bg: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: <Check size={10} />,
    },
    REJECTED: {
      label: t('achievements.statusRejected'),
      bg: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      icon: <XCircle size={10} />,
    },
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (item: AchievementItem) => {
    setForm({
      kind: item.kind,
      title: item.title,
      summary: item.summary,
      coverUrl: item.coverUrl || '',
      author: item.author,
      tags: item.tags.join(', '),
      galleryUrls: item.galleryUrls ? item.galleryUrls.join(', ') : '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('achievements.manager.confirmDelete'))) {
      deleteItem(id);
      showSuccess(t('achievements.manager.deletedSuccess'));
    }
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.summary.trim()) return;

    const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
    const galleryUrls = form.galleryUrls.split(',').map((s) => s.trim()).filter(Boolean);
    const data = {
      kind: form.kind,
      title: form.title,
      summary: form.summary,
      coverUrl: form.coverUrl || undefined,
      author: form.author || t('achievements.manager.defaultAuthor'),
      tags: tags.length ? tags : [t('achievements.manager.defaultTag')],
      galleryUrls: galleryUrls.length ? galleryUrls : undefined,
    };

    if (editingId) {
      updateItem(editingId, data);
      showSuccess(t('achievements.manager.updatedSuccess'));
    } else {
      addItem(data);
      showSuccess(t('achievements.manager.addedSuccess'));
    }

    setShowForm(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const id = await addPhoto(file);
    const photo = usePhotoStore.getState().getPhotoById(id);
    if (photo) {
      const path = await saveAchievementImage(`cover_${Date.now()}`, photo.dataUrl).catch(() => photo.dataUrl);
      setForm((f) => ({ ...f, coverUrl: path }));
    }
  };

  const selectPhoto = (dataUrl: string) => {
    setForm((f) => ({ ...f, coverUrl: dataUrl }));
  };

  const localizedItems = items.map((item) => localizeAchievement(item, t));
  const filteredItems = filterStatus === 'ALL'
    ? localizedItems
    : localizedItems.filter((i) => i.status === filterStatus);
  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-sda-blue dark:text-sda-gold" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            {t('achievements.manager.title')}
          </h3>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              {t('achievements.manager.pendingBadge', { count: pendingCount })}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-sda-blue px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
        >
          <Plus size={14} /> {t('achievements.manager.addButton')}
        </button>
      </div>

      {successMsg && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 p-2 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}

      <div className="mb-3 flex gap-1.5">
        {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={cn(
              'rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all cursor-pointer',
              filterStatus === status
                ? 'bg-sda-blue text-white'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
            )}
          >
            {status === 'ALL' ? t('common.all') : t(`achievements.status${status.charAt(0)}${status.slice(1).toLowerCase()}`)}
          </button>
        ))}
      </div>

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {filteredItems.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400">{t('achievements.noItems')}</p>
        )}
        {filteredItems.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800/60 dark:bg-slate-800/40"
            >
              <div className="flex min-w-0 items-center gap-3">
                {item.coverUrl && (
                  <img src={item.coverUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{item.title}</p>
                    <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-extrabold ${sc.bg}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-400">
                    {t(kindLabelKey[item.kind])} {' | '} {item.author}
                    {item.submittedBy && ` | ${t('achievements.manager.submittedBy', { name: item.submittedBy })}`}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {item.status === 'PENDING' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        approveItem(item.id);
                        showSuccess(t('achievements.manager.approvedSuccess'));
                      }}
                      className="rounded-xl bg-green-100 p-2.5 text-green-700 shadow-sm transition-all hover:bg-green-200 cursor-pointer dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50"
                      title={t('achievements.manager.approve')}
                    >
                      <Check size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        rejectItem(item.id);
                        showSuccess(t('achievements.manager.rejectedSuccess'));
                      }}
                      className="rounded-xl bg-red-100 p-2.5 text-red-600 shadow-sm transition-all hover:bg-red-200 cursor-pointer dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                      title={t('achievements.manager.reject')}
                    >
                      <XCircle size={18} />
                    </button>
                  </>
                )}
                {item.status === 'APPROVED' && (
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-slate-200 cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    title={t('achievements.manager.editAction')}
                  >
                    <Pencil size={16} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-red-100 hover:text-red-600 cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                  title={t('achievements.manager.deleteAction')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  {editingId ? t('achievements.manager.editTitle') : t('achievements.manager.newTitle')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800"
                  title={t('common.close')}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.kind')}</label>
                  <select
                    value={form.kind}
                    onChange={(e) => setForm((f) => ({ ...f, kind: e.target.value as AchievementKind }))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {KINDS.map((k) => (
                      <option key={k} value={k}>{t(kindLabelKey[k])}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.title')}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder={t('achievements.form.titlePlaceholder')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.summary')}</label>
                  <textarea
                    value={form.summary}
                    onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                    placeholder={t('achievements.form.summaryPlaceholder')}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.author')}</label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                    placeholder={t('achievements.form.authorPlaceholder')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.tags')}</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder={t('achievements.form.tagsPlaceholder')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.coverPhoto')}</label>
                  <div className="mt-1 flex items-center gap-2">
                    {form.coverUrl && (
                      <img src={form.coverUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
                    )}
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <ImageUp size={14} />
                      {form.coverUrl ? t('achievements.form.changePhoto') : t('achievements.form.uploadPhoto')}
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                  {photos.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {photos.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => selectPhoto(p.dataUrl)}
                          className={cn(
                            'h-10 w-10 overflow-hidden rounded-lg border-2 transition-all cursor-pointer',
                            form.coverUrl === p.dataUrl ? 'border-sda-blue' : 'border-transparent hover:border-slate-300'
                          )}
                        >
                          <img src={p.dataUrl} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {form.kind === 'GALLERY' && (
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('achievements.form.galleryImages')}</label>
                    <div className="mt-1 flex items-center gap-2">
                      <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        <ImageUp size={14} /> {t('achievements.form.addImage')}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                    {form.galleryUrls && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {form.galleryUrls.split(', ').filter(Boolean).map((url, i) => (
                          <div key={i} className="group relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const urls = form.galleryUrls.split(', ').filter(Boolean);
                                urls.splice(i, 1);
                                setForm((f) => ({ ...f, galleryUrls: urls.join(', ') }));
                              }}
                              className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity cursor-pointer group-hover:opacity-100"
                              title={t('settings.remove')}
                            >
                              <X size={8} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
                >
                  {editingId ? t('achievements.form.update') : t('achievements.form.create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
