import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { useFontSizeStore } from '@/store/useFontSizeStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useThemeStore();
  const { fontSize } = useFontSizeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  return <>{children}</>;
};
