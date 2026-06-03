export type AppLanguage = 'en' | 'rw';

export const PERSONAL_LANGUAGE_KEY = 'mifem-lang';
export const DEFAULT_LANGUAGE_KEY = 'mifem-default-lang';

const SUPPORTED_LANGUAGES: AppLanguage[] = ['en', 'rw'];

function isSupportedLanguage(value: string | null): value is AppLanguage {
  return value !== null && SUPPORTED_LANGUAGES.includes(value as AppLanguage);
}

export function getPreferredLanguage(): AppLanguage {
  const defaultLanguage = localStorage.getItem(DEFAULT_LANGUAGE_KEY);
  if (isSupportedLanguage(defaultLanguage)) return defaultLanguage;

  const personalLanguage = localStorage.getItem(PERSONAL_LANGUAGE_KEY);
  if (isSupportedLanguage(personalLanguage)) return personalLanguage;

  return 'en';
}

export function getSystemDefaultLanguage(): AppLanguage {
  const defaultLanguage = localStorage.getItem(DEFAULT_LANGUAGE_KEY);
  return isSupportedLanguage(defaultLanguage) ? defaultLanguage : 'en';
}

export function setPreferredLanguage(language: AppLanguage) {
  localStorage.setItem(PERSONAL_LANGUAGE_KEY, language);
}

export function setSystemDefaultLanguage(language: AppLanguage) {
  localStorage.setItem(DEFAULT_LANGUAGE_KEY, language);
}
