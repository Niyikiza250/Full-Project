import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import rw from './locales/rw.json';
import { getPreferredLanguage } from '@/lib/language';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    rw: { translation: rw },
  },
  lng: getPreferredLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
