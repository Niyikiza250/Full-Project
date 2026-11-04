import { ADVENTIST_LOGO } from '@/lib/assets';

interface AdventistLogoProps {
  className?: string;
  compact?: boolean;
}

export const AdventistLogo: React.FC<AdventistLogoProps> = ({ className, compact = false }) => {
  return (
    <img
      src={ADVENTIST_LOGO}
      alt="Seventh-day Adventist Church"
      className={`${compact ? 'h-10 sm:h-12' : 'h-12 sm:h-14 lg:h-16'} w-auto object-contain ${className ?? ''}`}
    />
  );
};
