import { useEffect } from 'react';
import { useBrandingStore } from '@/store/useBrandingStore';
import { MIFEM_FAVICON } from '@/lib/assets';

const DEFAULT_FAVICON = MIFEM_FAVICON;

export const FaviconUpdater: React.FC = () => {
  const faviconDataUrl = useBrandingStore((s) => s.faviconDataUrl);

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = faviconDataUrl || DEFAULT_FAVICON;
  }, [faviconDataUrl]);

  return null;
};
