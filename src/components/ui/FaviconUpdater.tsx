import { useEffect } from 'react';
import { useFaviconStore } from '@/store/useFaviconStore';

const DEFAULT_FAVICON = '/upload/MIFEM_logo.png';

export const FaviconUpdater: React.FC = () => {
  const { faviconDataUrl } = useFaviconStore();

  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) return;
    link.href = faviconDataUrl || DEFAULT_FAVICON;
  }, [faviconDataUrl]);

  return null;
};
