import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Plus, Trash2, Eye, EyeOff, Loader2,
  Image as ImageIcon, ChevronDown, ChevronUp, X, AlertCircle, Pencil, CheckCircle2,
} from 'lucide-react';
import { useHeroStore } from '@/store/useHeroStore';
import type { HeroSlide } from '@/components/home/heroData';
import { HERO_SLIDES } from '@/components/home/heroData';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const emptySlide = (): HeroSlide => ({
  id: `slide-${Date.now()}`,
  title: '',
  description: '',
  bgColor: 'bg-slate-900',
  overlayFrom: 'from-slate-900/30',
  overlayTo: 'to-transparent',
  bgImage: '',
  primaryCta: { label: '', href: '' },
  active: true,
});

const HeroSlideManager: React.FC = () => {
  const { t } = useTranslation();
  const storeSlides = useHeroStore((s) => s.slides);
  const saving = useHeroStore((s) => s.saving);
  const initialized = useHeroStore((s) => s.initialized);
  const fetchSlides = useHeroStore((s) => s.fetchSlides);
  const saveToApi = useHeroStore((s) => s.saveToApi);

  useEffect(() => {
    if (!initialized) fetchSlides();
  }, [fetchSlides, initialized]);

  const [draftSlides, setDraftSlides] = useState<HeroSlide[] | null>(null);
  // Render straight from the store until the admin makes a change.
  const localSlides = draftSlides ?? storeSlides;
  const setLocalSlides = (updater: React.SetStateAction<HeroSlide[]>) => {
    setDraftSlides((prev) => {
      const base = prev ?? storeSlides;
      return typeof updater === 'function' ? updater(base) : updater;
    });
  };

  const hasChanges = JSON.stringify(localSlides) !== JSON.stringify(storeSlides);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeroSlide | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleOpenAdd = () => {
    setForm(emptySlide());
    setEditingId(null);
    setShowForm(true);
  };

  const handleOpenEdit = (slide: HeroSlide) => {
    setForm({ ...slide });
    setEditingId(slide.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('admin.confirmDeleteSlide', 'Delete this slide?'))) {
      setLocalSlides((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setLocalSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    setLocalSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  };

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => (f ? { ...f, bgImage: reader.result as string } : f));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleSubmitForm = () => {
    if (!form || !form.title.trim()) return;

    if (editingId) {
      setLocalSlides((prev) =>
        prev.map((s) => (s.id === editingId ? { ...form } : s))
      );
    } else {
      setLocalSlides((prev) => [...prev, { ...form }]);
    }

    setShowForm(false);
    setForm(null);
    setEditingId(null);
  };

  const handleReset = () => {
    if (window.confirm(t('admin.confirmReset', 'Reset to default slides?'))) {
      setLocalSlides([...HERO_SLIDES]);
    }
  };

  const handleSave = async () => {
    const prevSlides = useHeroStore.getState().slides;
    useHeroStore.setState({ slides: [...localSlides] });
    const ok = await saveToApi();
    if (ok) {
      setDraftSlides(null);
      setErrorMsg(null);
      showSuccess(t('common.saved', 'Saved successfully'));
    } else {
      useHeroStore.setState({ slides: prevSlides });
      setErrorMsg(t('common.saveError', 'Failed to save'));
    }
  };

  const handleDiscard = () => {
    setDraftSlides(null);
  };

  const activeCount = localSlides.filter((s) => s.active).length;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon size={18} className="text-sda-blue dark:text-sda-gold" />
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
            {t('admin.heroSlides', 'Hero Slides')}
          </h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-black text-green-800 dark:bg-green-900/30 dark:text-green-300">
              {t('admin.activeCount', { count: activeCount })}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold text-slate-500 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
          >
            {t('common.reset', 'Reset')}
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-sda-blue px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
          >
            <Plus size={14} /> {t('admin.addSlide', 'Add Slide')}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 p-2 text-xs font-semibold text-green-700 dark:border-green-900/50 dark:bg-green-950/20 dark:text-green-400">
          <CheckCircle2 size={14} /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-3 flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 p-2 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle size={14} /> {errorMsg}
        </div>
      )}

      {hasChanges && (
        <div className="mb-4 flex items-center justify-end gap-2 rounded-xl border border-sda-blue/30 bg-sda-blue/5 p-3 dark:border-sda-blue/20 dark:bg-sda-blue/10">
          <span className="mr-auto text-[10px] font-bold text-slate-500 dark:text-slate-400">
            {t('common.unsavedChanges', 'You have unsaved changes')}
          </span>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 cursor-pointer disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {t('common.discard', 'Discard')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-sda-blue px-5 py-2 text-xs font-bold text-white shadow-md shadow-sda-blue/20 transition-all hover:bg-sda-blue-dark cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t('common.saveChanges', 'Save Changes')}
          </button>
        </div>
      )}

      <div className="max-h-96 space-y-2 overflow-y-auto">
        {localSlides.length === 0 && (
          <p className="py-8 text-center text-xs text-slate-400">{t('admin.noSlides', 'No slides yet')}</p>
        )}
        {localSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'flex items-center justify-between rounded-xl border p-3 group',
              slide.active
                ? 'border-slate-100 bg-slate-50 dark:border-slate-800/60 dark:bg-slate-800/40'
                : 'border-slate-100 bg-slate-50/50 dark:border-slate-800/30 dark:bg-slate-800/20 opacity-60'
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => handleMove(slide.id, -1)}
                  disabled={index === 0}
                  className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronUp size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(slide.id, 1)}
                  disabled={index === localSlides.length - 1}
                  className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30 cursor-pointer"
                >
                  <ChevronDown size={12} />
                </button>
              </div>

              {slide.bgImage ? (
                <img src={slide.bgImage} alt="" className="h-10 w-14 shrink-0 rounded-lg object-cover" />
              ) : (
                <div className="flex h-10 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700">
                  <ImageIcon size={14} className="text-slate-400" />
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                    {slide.title || t('admin.untitledSlide', 'Untitled Slide')}
                  </p>
                  <span className={cn(
                    'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-extrabold',
                    slide.active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  )}>
                    {slide.active ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </span>
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  {slide.primaryCta.label} → {slide.primaryCta.href}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleActive(slide.id)}
                className={cn(
                  'rounded-xl p-2 shadow-sm transition-all cursor-pointer',
                  slide.active
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                )}
                title={slide.active ? t('common.deactivate', 'Deactivate') : t('common.activate', 'Activate')}
              >
                {slide.active ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              <button
                type="button"
                onClick={() => handleOpenEdit(slide)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-slate-200 cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                title={t('common.edit', 'Edit')}
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(slide.id)}
                className="rounded-xl bg-slate-100 p-2 text-slate-500 transition-all hover:bg-red-100 hover:text-red-600 cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                title={t('common.delete', 'Delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && form && (
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
                  {editingId ? t('admin.editSlide', 'Edit Slide') : t('admin.newSlide', 'New Slide')}
                </h4>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer dark:hover:bg-slate-800"
                  title={t('common.close', 'Close')}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('admin.slideTitle', 'Title')}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => (f ? { ...f, title: e.target.value } : f))}
                    placeholder={t('admin.slideTitlePlaceholder', 'Slide title...')}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('admin.slideDescription', 'Description')}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => (f ? { ...f, description: e.target.value } : f))}
                    placeholder={t('admin.slideDescriptionPlaceholder', 'Slide description...')}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('admin.ctaLabel', 'Button Label')}</label>
                    <input
                      type="text"
                      value={form.primaryCta.label}
                      onChange={(e) => setForm((f) => (f ? { ...f, primaryCta: { ...f.primaryCta, label: e.target.value } } : f))}
                      placeholder={t('admin.ctaLabelPlaceholder', 'Get Started')}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('admin.ctaLink', 'Button Link')}</label>
                    <input
                      type="text"
                      value={form.primaryCta.href}
                      onChange={(e) => setForm((f) => (f ? { ...f, primaryCta: { ...f.primaryCta, href: e.target.value } } : f))}
                      placeholder={t('admin.ctaLinkPlaceholder', '/register')}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{t('admin.bgImage', 'Background Image')}</label>
                  <div className="mt-1 flex items-center gap-2">
                    {form.bgImage && (
                      <img src={form.bgImage} alt="" className="h-12 w-16 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700" />
                    )}
                    <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <ImageIcon size={14} />
                      {form.bgImage ? t('common.change', 'Change') : t('common.upload', 'Upload')}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                    {form.bgImage && (
                      <button
                        type="button"
                        onClick={() => setForm((f) => (f ? { ...f, bgImage: '' } : f))}
                        className="rounded-lg p-1 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-50 cursor-pointer dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleSubmitForm}
                  className="rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark cursor-pointer"
                >
                  {editingId ? t('common.save', 'Save') : t('common.create', 'Create')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default HeroSlideManager;
