import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAchievementAdminStore } from '@/store/useAchievementAdminStore';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { saveAchievementImage } from '@/api/achievementStorage';
import { Trophy, Plus, X, ImageUp, CheckCircle2, Clock, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AchievementKind } from '@/types/achievement';

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

export const LeaderAchievementForm: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  const { submitFromLeader } = useAchievementAdminStore();
  const { photos, addPhoto } = usePhotoStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleOpenAdd = () => {
    setForm(emptyForm);
    setShowForm(true);
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

  const handleSubmit = () => {
    if (!form.title.trim() || !form.summary.trim()) return;

    const tags = form.tags.split(',').map((s) => s.trim()).filter(Boolean);
    const galleryUrls = form.galleryUrls.split(',').map((s) => s.trim()).filter(Boolean);

    submitFromLeader({
      kind: form.kind,
      title: form.title,
      summary: form.summary,
      coverUrl: form.coverUrl || undefined,
      author: form.author || user?.name || t('achievements.leader.defaultAuthor'),
      tags: tags.length ? tags : [t('achievements.manager.defaultTag')],
      galleryUrls: galleryUrls.length ? galleryUrls : undefined,
      submittedBy: user?.name || t('achievements.leader.unknownSubmitter'),
      submittedByRole: user?.role || 'UNKNOWN',
    });

    showSuccess(t('achievements.leader.submittedSuccess'));
    setShowForm(false);
    setForm(emptyForm);
  };

  if (!isAdmin) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-sda-blue dark:text-sda-gold" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            {t('achievements.leader.title')}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-sda-blue px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
        >
          <Plus size={14} /> {t('achievements.leader.newSubmission')}
        </button>
      </div>

      {successMsg && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 p-2 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}

      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/30 dark:bg-amber-950/10">
        <Clock size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
          {t('achievements.leader.approvalNotice')}
        </p>
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
                  {t('achievements.leader.modalTitle')}
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
                          className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${form.coverUrl === p.dataUrl ? 'border-sda-blue' : 'border-transparent hover:border-slate-300'}`}
                        >
                          <img src={p.dataUrl} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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
                  className="flex items-center gap-1.5 rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
                >
                  <Send size={14} /> {t('achievements.leader.submitButton')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
