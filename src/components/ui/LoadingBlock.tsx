import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingBlockProps {
  label?: string;
  className?: string;
}

const LoadingBlock: React.FC<LoadingBlockProps> = ({ label, className }) => (
  <div
    className={cn(
      'flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
      className
    )}
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <Loader2 className="h-9 w-9 animate-spin text-sda-blue" aria-hidden />
    {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
  </div>
);

export default LoadingBlock;
