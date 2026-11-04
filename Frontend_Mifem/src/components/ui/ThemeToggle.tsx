import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';

interface ThemeToggleProps {
  className?: string;
  variant?: 'nav' | 'hero';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className, variant = 'nav' }) => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-lg text-xs font-bold transition-all',
        variant === 'hero'
          ? 'px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white'
          : 'p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
      <span className="sr-only">{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
    </button>
  );
};

export default ThemeToggle;
