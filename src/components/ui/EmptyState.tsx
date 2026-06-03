import React from 'react';
import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  className,
  icon = <Inbox className="text-slate-300" size={40} aria-hidden />,
}) => (
  <motion.div
    role="status"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      'flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-900/40 px-6 py-14 text-center',
      className
    )}
  >
    <div className="mb-3" aria-hidden>
      {icon}
    </div>
    <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
    {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
  </motion.div>
);

export default EmptyState;
