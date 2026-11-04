import { useEffect } from 'react';
import { useFaviconStore } from '@/store/useFaviconStore';
import { MIFEM_LOGO } from '@/lib/assets';

const DEFAULT_FAVICON = MIFEM_LOGO;

export const FaviconUpdater: React.FC = () => {
  const { faviconDataUrl } = useFaviconStore();

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = faviconDataUrl || DEFAULT_FAVICON;
  }, [faviconDataUrl]);

  return null;
};
