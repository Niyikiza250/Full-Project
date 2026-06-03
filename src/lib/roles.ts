import type { TFunction } from 'i18next';

export function getTranslatedRoleLabel(role: string | null | undefined, t: TFunction) {
  if (!role) return t('header.roleFallback');

  const key = `admin.role_${role}`;
  const translated = t(key);
  if (translated !== key) return translated;

  return role.replace(/_/g, ' ');
}
