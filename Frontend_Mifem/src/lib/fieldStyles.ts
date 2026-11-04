import { clsx } from 'clsx';

export function fieldClass(error?: { message?: string }): string {
  return clsx(
    'w-full px-4 py-2.5 rounded-xl border outline-none transition-all duration-200 text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500',
    error
      ? 'border-red-200 bg-red-50/50 dark:bg-red-900/10 focus:border-red-400 focus:ring-4 focus:ring-red-500/10'
      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 focus:border-sda-blue focus:ring-4 focus:ring-sda-blue/10',
  );
}