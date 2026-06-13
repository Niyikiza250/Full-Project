interface AdventistLogoProps {
  className?: string;
  compact?: boolean;
}

export const AdventistLogo: React.FC<AdventistLogoProps> = ({ className, compact = false }) => {
  return (
    <img
      src="/upload/adventist-logo.png"
      alt="Seventh-day Adventist Church"
      className={`${compact ? 'h-10 sm:h-12' : 'h-12 sm:h-14 lg:h-16'} w-auto object-contain ${className ?? ''}`}
    />
  );
};
