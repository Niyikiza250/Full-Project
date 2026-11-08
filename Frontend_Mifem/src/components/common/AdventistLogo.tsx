import { ADVENTIST_LOGO } from '@/lib/assets';
import { cn } from '@/lib/utils';
import { useBrandingStore } from '@/store/useBrandingStore';

interface AdventistLogoProps {
  className?: string;
  compact?: boolean;
}

export const AdventistLogo: React.FC<AdventistLogoProps> = ({ className, compact = false }) => {
  const adventistLogoDataUrl = useBrandingStore((s) => s.adventistLogoDataUrl);

  return (
    <img
      src={adventistLogoDataUrl || ADVENTIST_LOGO}
      alt="Seventh-day Adventist Church"
      draggable={false}
      className={cn(
        'block shrink-0 select-none object-contain rounded-lg bg-white p-0.5 dark:bg-white',
        compact ? 'h-10 w-10 sm:h-12 sm:w-12' : 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16',
        className
      )}
    />
  );
};
