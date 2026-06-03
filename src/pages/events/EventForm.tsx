import React, { useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/useAuthStore';
import { ArrowLeft, Save, Loader2, Plus, Trash2, Clock, ImageUp } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useEvent, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';
import { EventCategory, EventStatus } from '@/types/event';
import { CATEGORY_LABELS } from '@/utils/eventHelpers';

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const EventForm: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (user?.role !== 'ADMIN') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  const isEdit = !!id;
  const { data: event, isLoading } = useEvent(id || '');
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const [previewImage, setPreviewImage] = React.useState<string | null>(event?.imageUrl || null);

  const eventSchema = useMemo(() => {
    const timelineSchema = z.object({
      id: z.string(),
      time: z.string().min(1, t('event.validation.timeRequired')),
      activity: z.string().min(1, t('event.validation.activityRequired')),
      description: z.string().optional(),
    });

    return z.object({
      title: z.string().min(3, t('event.validation.titleMin')),
      description: z.string().min(10, t('event.validation.descriptionMin')),
      category: z.enum(['WORSHIP', 'Field', 'COMMUNITY', 'YOUTH', 'TRAINING', 'OTHER']),
      status: z.enum(['DRAFT', 'UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']),
      startDate: z.string().min(1, t('event.validation.startDateRequired')),
      endDate: z.string().min(1, t('event.validation.endDateRequired')),
      location: z.string().min(2, t('event.validation.locationRequired')),
      organizer: z.string().min(2, t('event.validation.organizerRequired')),
      maxAttendees: z.coerce.number().optional(),
      imageUrl: z.string().optional().or(z.literal('')),
      timeline: z.array(timelineSchema),
    });
  }, [t]);

  type EventFormValues = z.infer<typeof eventSchema>;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      category: 'WORSHIP',
      status: 'UPCOMING',
      timeline: [{ id: crypto.randomUUID(), time: '09:00', activity: '', description: '' }],
    },
    values: event
      ? {
          title: event.title,
          description: event.description,
          category: event.category,
          status: event.status,
          startDate: toDatetimeLocal(event.startDate),
          endDate: toDatetimeLocal(event.endDate),
          location: event.location,
          organizer: event.organizer,
          maxAttendees: event.maxAttendees,
          imageUrl: event.imageUrl || '',
          timeline: event.timeline.length
            ? event.timeline
            : [{ id: crypto.randomUUID(), time: '09:00', activity: '', description: '' }],
        }
      : undefined,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'timeline' });

  const onSubmit = async (data: EventFormValues) => {
    const payload = {
      title: data.title,
      description: data.description,
      category: data.category as EventCategory,
      status: data.status as EventStatus,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      location: data.location,
      organizer: data.organizer,
      maxAttendees: data.maxAttendees || undefined,
      imageUrl: data.imageUrl || undefined,
      timeline: data.timeline.map((t) => ({
        ...t,
        id: t.id || crypto.randomUUID(),
      })),
    };

    if (isEdit && id) {
      await updateMutation.mutateAsync({ id, updates: payload });
      navigate(ROUTES.EVENT_DETAILS.replace(':id', id));
    } else {
      const created = await createMutation.mutateAsync(payload);
      navigate(ROUTES.EVENT_DETAILS.replace(':id', created.id));
    }
  };

  if (isEdit && isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-sda-blue" size={48} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(ROUTES.EVENTS)}
          className="text-slate-500 hover:text-sda-blue flex items-center font-bold text-sm transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          {t('event.backToEvents')}
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isEdit ? t('event.editEvent') : t('event.createEvent')}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('event.formBasicInfo')}</h2>

          <FormField label={t('event.formEventTitle')} error={errors.title?.message}>
            <input {...register('title')} className={inputClass} placeholder={t('event.formTitlePlaceholder')} />
          </FormField>

          <FormField label={t('event.formDescription')} error={errors.description?.message}>
            <textarea
              {...register('description')}
              rows={4}
              className={inputClass}
              placeholder={t('event.formDescriptionPlaceholder')}
            />
          </FormField>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FormField label={t('event.formCategory')} error={errors.category?.message}>
              <select {...register('category')} className={inputClass}>
                {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_LABELS[cat]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label={t('event.formStatus')} error={errors.status?.message}>
              <select {...register('status')} className={inputClass}>
                <option value="DRAFT">{t('event.formStatusDraft')}</option>
                <option value="UPCOMING">{t('event.tabUpcoming')}</option>
                <option value="ONGOING">{t('event.tabOngoing')}</option>
                <option value="COMPLETED">{t('event.tabCompleted')}</option>
                <option value="CANCELLED">{t('event.formStatusCancelled')}</option>
              </select>
            </FormField>
          </motion.div>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">{t('event.formSchedule')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('event.formStart')} error={errors.startDate?.message}>
              <input type="datetime-local" {...register('startDate')} className={inputClass} />
            </FormField>
            <FormField label={t('event.formEnd')} error={errors.endDate?.message}>
              <input type="datetime-local" {...register('endDate')} className={inputClass} />
            </FormField>
          </div>
          <FormField label={t('event.formLocation')} error={errors.location?.message}>
            <input {...register('location')} className={inputClass} placeholder={t('event.formLocationPlaceholder')} />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label={t('event.formOrganizer')} error={errors.organizer?.message}>
              <input {...register('organizer')} className={inputClass} />
            </FormField>
            <FormField label={t('event.formMaxAttendees')} error={errors.maxAttendees?.message}>
              <input type="number" {...register('maxAttendees')} className={inputClass} min={1} />
            </FormField>
          </div>
          <FormField label={t('event.formCoverImage')} error={errors.imageUrl?.message}>
            <div className="flex items-center gap-3">
              {previewImage && (
                <div className="w-20 h-14 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0">
                  <img src={previewImage} alt={t('event.formPreviewAlt')} className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:border-sda-blue transition-all">
                <ImageUp size={16} />
                {previewImage ? t('event.formChangePhoto') : t('event.formUploadPhoto')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const dataUrl = ev.target?.result as string;
                      setPreviewImage(dataUrl);
                      setValue('imageUrl', dataUrl, { shouldValidate: true });
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {previewImage && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    setValue('imageUrl', '', { shouldValidate: true });
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <input type="hidden" {...register('imageUrl')} />
          </FormField>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} />
              {t('event.formTimeline')}
            </h2>
            <button
              type="button"
              onClick={() =>
                append({ id: crypto.randomUUID(), time: '12:00', activity: '', description: '' })
              }
              className="text-sm font-bold text-sda-blue flex items-center gap-1 hover:underline"
            >
              <Plus size={16} /> {t('event.formAddItem')}
            </button>
          </div>

          {fields.map((field, index) => (
            <motion.div
              key={field.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl items-start"
            >
              <div className="sm:col-span-2">
                  <input
                    {...register(`timeline.${index}.time`)}
                    className={inputClass}
                    placeholder={t('event.formTimePlaceholder')}
                  />
                </div>
                <motion.div className="sm:col-span-4">
                  <input
                    {...register(`timeline.${index}.activity`)}
                    className={inputClass}
                    placeholder={t('event.formActivityPlaceholder')}
                  />
                </motion.div>
                <div className="sm:col-span-5">
                  <input
                    {...register(`timeline.${index}.description`)}
                    className={inputClass}
                    placeholder={t('event.formDescriptionOptional')}
                  />
              </div>
              <button
                type="button"
                onClick={() => fields.length > 1 && remove(index)}
                className="sm:col-span-1 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg justify-self-end"
                disabled={fields.length <= 1}
              >
                <Trash2 size={18} />
              </button>
              <input type="hidden" {...register(`timeline.${index}.id`)} />
            </motion.div>
          ))}
        </section>

        <button
          type="submit"
          disabled={isSubmitting || createMutation.isPending || updateMutation.isPending}
          className="w-full sm:w-auto bg-sda-blue hover:bg-sda-blue-dark text-white font-bold px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {(isSubmitting || createMutation.isPending || updateMutation.isPending) ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              <Save size={18} />
              {isEdit ? t('event.formSaveChanges') : t('event.createEvent')}
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
};

const inputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 outline-none focus:ring-2 focus:ring-sda-blue transition-all';

const FormField: React.FC<{
  label: string;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div>
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">{label}</label>
    {children}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default EventForm;
