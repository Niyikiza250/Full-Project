import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, ImageUp, Loader2, Trash2 } from 'lucide-react';
import { useBrandingStore } from '@/store/useBrandingStore';
import type { BrandAsset } from '@/api/branding';
import { ADVENTIST_LOGO, MIFEM_FAVICON, MIFEM_LOGO } from '@/lib/assets';
import { getApiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

type AssetStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AssetCardProps {
  asset: BrandAsset;
  title: string;
  description: string;
  value: string | null;
  fallback: string;
  previewClassName?: string;
}

const AssetCard: React.FC<AssetCardProps> = ({
  asset,
  title,
  description,
  value,
  fallback,
  previewClassName,
}) => {
  const { t } = useTranslation();
  const saveAsset = useBrandingStore((s) => s.saveAsset);
  const removeAsset = useBrandingStore((s) => s.removeAsset);
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<AssetStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatus('error');
      setError(t('settings.brandingInvalidFile', 'Please choose an image file.'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setStatus('error');
      setError(t('settings.brandingTooLarge', 'Image must be smaller than 5MB.'));
      return;
    }

    setStatus('saving');
    setError(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('read failed'));
        reader.readAsDataURL(file);
      });
      await saveAsset(asset, dataUrl);
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      setStatus('error');
      setError(getApiErrorMessage(error, t('settings.brandingSaveFailed', 'Upload failed. Please try again.')));
    }
  };

  const handleReset = async () => {
    setStatus('saving');
    setError(null);
    try {
      await removeAsset(asset);
      setStatus('saved');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch (error) {
      setStatus('error');
      setError(getApiErrorMessage(error, t('settings.brandingSaveFailed', 'Upload failed. Please try again.')));
    }
  };

  const saving = status === 'saving';

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            'flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800',
            previewClassName,
          )}
        >
          <img
            src={value || fallback}
            alt={title}
            className="h-full w-full object-contain"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-800 dark:text-white">{title}</p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            {description}
          </p>
          <p className="mt-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
            {value
              ? t('settings.brandingSavedInDb', 'Saved in the database and applied system-wide.')
              : t('settings.brandingUsingDefault', 'Using the default image.')}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white transition-all hover:bg-sda-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <ImageUp size={14} />}
              {value ? t('settings.changeLogo') : t('settings.uploadLogo')}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => void handleReset()}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900/50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={14} />
                {t('settings.remove')}
              </button>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={handleFile}
              className="hidden"
            />
          </div>

          {status === 'saved' && (
            <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400">
              <CheckCircle2 size={12} />
              {t('settings.brandingSaved', 'Saved. All users will see this change.')}
            </p>
          )}
          {status === 'error' && error && (
            <p className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-red-600 dark:text-red-400">
              <AlertCircle size={12} />
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BrandLogoManager: React.FC = () => {
  const { t } = useTranslation();
  const logoDataUrl = useBrandingStore((s) => s.logoDataUrl);
  const adventistLogoDataUrl = useBrandingStore((s) => s.adventistLogoDataUrl);
  const faviconDataUrl = useBrandingStore((s) => s.faviconDataUrl);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4">
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
          {t('settings.brandLogoManagement', 'Brand & Logos')}
        </h2>
        <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {t(
            'settings.brandLogoManagementDesc',
            'Upload the logos used across the whole system. Changes are stored in the database and stay active for every user until you change them again.',
          )}
        </p>
      </div>

      <div className="space-y-3">
        <AssetCard
          asset="logo"
          title={t('settings.mifemLogo', 'MIFEM Logo')}
          description={t('settings.logoDesc', 'Main logo shown in the header, sidebar and footer.')}
          value={logoDataUrl}
          fallback={MIFEM_LOGO}
        />
        <AssetCard
          asset="adventistLogo"
          title={t('settings.adventistLogo', 'Seventh-day Adventist Logo')}
          description={t(
            'settings.adventistLogoDesc',
            'Church logo shown on the landing page, auth pages and mobile header.',
          )}
          value={adventistLogoDataUrl}
          fallback={ADVENTIST_LOGO}
        />
        <AssetCard
          asset="favicon"
          title={t('settings.faviconTitle', 'Favicon / Title Logo')}
          description={t('settings.faviconDesc', 'Small icon shown in the browser tab.')}
          value={faviconDataUrl}
          fallback={MIFEM_FAVICON}
        />
      </div>
    </section>
  );
};

export default BrandLogoManager;
