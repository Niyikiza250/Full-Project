import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className, delay = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/10 backdrop-blur-xl shadow-sm hover:shadow-xl dark:shadow-lg dark:hover:shadow-2xl transition-all duration-300',
        'hover:-translate-y-1.5 hover:bg-white/90 dark:hover:bg-white/15',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
