import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2, Send, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { subscribeEmail } from '@/services/subscriptionService';

type SubscriptionStatus = 'idle' | 'loading' | 'success' | 'error';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailSubscriptionProps {
  className?: string;
  title?: string;
  subtitle?: string;
}

const EmailSubscription: React.FC<EmailSubscriptionProps> = ({
  className,
  title = 'Stay Connected',
  subtitle = 'Subscribe for the latest MIFEM updates & announcements.',
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SubscriptionStatus>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setStatus('idle');
      setMessage('');
    }, 6500);
    return () => clearTimeout(timer);
  }, [message]);

  const validate = (value: string): string | null => {
    if (!value.trim()) return 'Email address is required.';
    if (!EMAIL_REGEX.test(value.trim())) return 'Please enter a valid email address.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const error = validate(trimmed);
    if (error) {
      setStatus('error');
      setMessage(error);
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await subscribeEmail(trimmed);
      if (res.success) {
        setStatus('success');
        setMessage(res.message || 'You have been subscribed successfully!');
        setEmail('');
      } else {
        setStatus('error');
        setMessage(res.message || 'Subscription failed. Please try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (status === 'error' || status === 'success') {
      setStatus('idle');
      setMessage('');
    }
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-white/15 bg-black/30 sm:bg-black/25 backdrop-blur-[2px] sm:backdrop-blur-sm p-3.5 sm:p-4 shadow-xl',
        className
      )}
    >
      {/* Decorative top accent line */}
      <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sda-gold/60 to-transparent" />

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-5 h-5 rounded-md bg-sda-gold/20 text-sda-gold border border-sda-gold/30 shrink-0">
          <Bell size={12} />
        </span>
        <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide">
          {title}
        </h3>
      </div>
      <p className="text-[11px] sm:text-xs text-white/70 mb-2.5 font-medium leading-relaxed">
        {subtitle}
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative flex items-center bg-white/10 hover:bg-white/[0.14] focus-within:bg-white/[0.16] border border-white/20 focus-within:border-sda-gold/70 focus-within:ring-2 focus-within:ring-sda-gold/30 rounded-xl p-1 transition-all">
          <Mail size={15} className="text-white/40 ml-2.5 mr-2 shrink-0 pointer-events-none" />
          <input
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="Enter your email"
            aria-label="Email address"
            disabled={status === 'loading'}
            className="w-full bg-transparent text-white placeholder:text-white/40 text-xs sm:text-sm font-medium outline-none py-1.5 min-w-0"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-1.5 sm:py-2 text-xs font-bold transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer',
              'bg-sda-gold text-sda-blue hover:bg-sda-gold-light active:scale-95',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100'
            )}
          >
            {status === 'loading' ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <span>Subscribe</span>
                <Send size={12} className="shrink-0" />
              </>
            )}
          </button>
        </div>

        {/* Feedback message */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              key={message}
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-2 mt-2 px-2.5 py-1.5 rounded-lg text-xs font-medium overflow-hidden',
                status === 'success' && 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300',
                status === 'error' && 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
              )}
              role="alert"
            >
              {status === 'success' ? (
                <CheckCircle size={13} className="shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle size={13} className="shrink-0 text-rose-400" />
              )}
              <span className="leading-tight truncate">{message}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};

export default EmailSubscription;
