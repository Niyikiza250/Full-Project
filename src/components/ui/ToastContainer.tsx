import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore, ToastItem } from '@/store/useNotificationStore';
import { useAudioChime } from '@/hooks/useAudioChime';
import { 
  Bell, CheckCircle, AlertTriangle, XCircle, Info, Megaphone, X, Key, UserCheck 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useNotificationStore();
  const { playChime } = useAudioChime();
  const prevCountRef = useRef(toasts.length);

  // Play audio chime automatically when a new toast is added
  useEffect(() => {
    if (toasts.length > prevCountRef.current) {
      playChime();
    }
    prevCountRef.current = toasts.length;
  }, [toasts.length, playChime]);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onDismiss }) => {
  const { id, title, body, type, duration, onClick } = toast;
  
  const getIcon = () => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle className="text-emerald-500 shrink-0" size={20} />;
      case 'WARNING':
        return <AlertTriangle className="text-amber-500 shrink-0" size={20} />;
      case 'ALERT':
        return <XCircle className="text-rose-500 shrink-0" size={20} />;
      case 'ANNOUNCEMENT':
        return <Megaphone className="text-sda-gold shrink-0 animate-bounce" size={20} />;
      case 'INFO':
      default:
        return <Info className="text-sda-blue shrink-0" size={20} />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'SUCCESS':
        return 'border-emerald-500/30 bg-emerald-50/95 dark:bg-emerald-950/20';
      case 'WARNING':
        return 'border-amber-500/30 bg-amber-50/95 dark:bg-amber-950/20';
      case 'ALERT':
        return 'border-rose-500/30 bg-rose-50/95 dark:bg-rose-950/20';
      case 'ANNOUNCEMENT':
        return 'border-sda-gold/40 bg-amber-50/95 dark:bg-slate-900/95 border-2 shadow-sda-gold/10';
      case 'INFO':
      default:
        return 'border-sda-blue/30 bg-slate-50/95 dark:bg-slate-900/95';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={cn(
        'pointer-events-auto w-full border rounded-2xl shadow-xl backdrop-blur-md p-4 flex gap-3.5 relative overflow-hidden cursor-pointer group',
        getBorderColor()
      )}
      onClick={() => {
        if (onClick) onClick();
        onDismiss(id);
      }}
    >
      {/* Toast Accent Indicator */}
      <div className="flex gap-3 items-start w-full pr-6">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug truncate">
            {title}
          </h4>
          <p className="text-[11px] font-semibold text-slate-650 dark:text-slate-350 leading-relaxed mt-0.5 line-clamp-2">
            {body}
          </p>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(id);
        }}
        className="absolute top-3.5 right-3.5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <X size={14} />
      </button>

      {/* Progress timer indicator */}
      {duration && duration > 0 && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
          className={cn(
            'absolute bottom-0 left-0 h-0.5',
            type === 'SUCCESS' && 'bg-emerald-500',
            type === 'WARNING' && 'bg-amber-500',
            type === 'ALERT' && 'bg-rose-500',
            type === 'ANNOUNCEMENT' && 'bg-sda-gold',
            type === 'INFO' && 'bg-sda-blue'
          )}
        />
      )}
    </motion.div>
  );
};
