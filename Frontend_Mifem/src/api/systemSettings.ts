import apiClient from './client';
import type { AppLanguage } from '@/lib/language';

export async function getDefaultLanguageSetting(): Promise<AppLanguage | null> {
  const { data } = await apiClient.get<{ data: { language: string } }>('/system-settings/language');
  const lang = data.data?.language;
  if (lang === 'en' || lang === 'rw' || lang === 'fr') return lang;
  return null;
}

export async function saveDefaultLanguageSetting(language: AppLanguage): Promise<void> {
  await apiClient.put('/system-settings/language', { language });
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
  const { data } = await apiClient.get<{ data: { key: string; value: string | SmtpConfig | null } }>('/system-settings/smtp');
  const raw = data.data?.value;
  if (!raw) return null;
  if (typeof raw === 'string') {
    try { return JSON.parse(raw) as SmtpConfig; } catch { return null; }
  }
  return raw as SmtpConfig;
}

export async function saveSmtpConfig(config: SmtpConfig): Promise<void> {
  await apiClient.put('/system-settings/smtp', { value: JSON.stringify(config) });
}

export async function testSmtpConnection(
  config: SmtpConfig & { testEmail?: string },
): Promise<{ success: boolean; error?: string; previewUrl?: string }> {
  const { data } = await apiClient.post<{ success: boolean; data?: { success: boolean; previewUrl?: string }; message?: string }>(
    '/system-settings/smtp-test',
    config,
  );
  if (data.success && data.data) {
    return { success: true, previewUrl: data.data.previewUrl };
  }
  return { success: false, error: data.message || 'SMTP test failed' };
}

export async function saveSystemSetting(key: string, value: string): Promise<void> {
  await apiClient.put(`/system-settings/${key}`, { value });
}

export async function getSystemSetting<T = string>(key: string): Promise<T | null> {
  const { data } = await apiClient.get<{ data: { key: string; value: T | null } }>(`/system-settings/${key}`);
  return data.data?.value ?? null;
}
