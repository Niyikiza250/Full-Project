import type { AppLanguage } from '@/lib/language';

const SYSTEM_SETTINGS_API = '/api/system-settings';

function isAppLanguage(value: unknown): value is AppLanguage {
  return value === 'en' || value === 'rw';
}

export async function getDefaultLanguageSetting(): Promise<AppLanguage | null> {
  const res = await fetch(`${SYSTEM_SETTINGS_API}/language`);
  if (!res.ok) return null;

  const data: unknown = await res.json();
  if (
    typeof data === 'object' &&
    data !== null &&
    'language' in data &&
    isAppLanguage((data as { language?: unknown }).language)
  ) {
    return (data as { language: AppLanguage }).language;
  }

  return null;
}

export async function saveDefaultLanguageSetting(language: AppLanguage): Promise<void> {
  await fetch(`${SYSTEM_SETTINGS_API}/language`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language }, null, 2),
  });
}
