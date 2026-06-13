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

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from?: string;
  fromName?: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const res = await fetch(`${SYSTEM_SETTINGS_API}/smtp`);
  if (!res.ok) return null;
  const data = await res.json();
  return (data as { value?: SmtpConfig }).value ?? null;
}

export async function saveSmtpConfig(config: SmtpConfig): Promise<void> {
  await fetch(`${SYSTEM_SETTINGS_API}/smtp`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: config }),
  });
}

export async function testSmtpConnection(config: SmtpConfig & { testEmail?: string }): Promise<{ success: boolean; error?: string; previewUrl?: string }> {
  const res = await fetch(`${SYSTEM_SETTINGS_API}/smtp-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  return await res.json();
}
