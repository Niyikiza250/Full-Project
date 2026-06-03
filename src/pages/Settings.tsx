import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/useThemeStore';
import { useLogoStore } from '@/store/useLogoStore';
import { useFaviconStore } from '@/store/useFaviconStore';
import { useFontSizeStore } from '@/store/useFontSizeStore';
import { usePhotoStore } from '@/store/usePhotoStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getSystemDefaultLanguage, setPreferredLanguage, setSystemDefaultLanguage, type AppLanguage } from '@/lib/language';
import { getDefaultLanguageSetting, saveDefaultLanguageSetting } from '@/api/systemSettings';
import { ROUTES } from '@/constants/routes';
import { useNavigate, Navigate } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Sun, Moon, Languages, Bell, Shield, 
  Smartphone, Eye, HelpCircle, LogOut, CheckCircle2, User, Key, ImageUp, Trash2,
  Plus, Minus
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { logoDataUrl, setLogo, removeLogo } = useLogoStore();
  const { faviconDataUrl, setFavicon, removeFavicon } = useFaviconStore();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSizeStore();
  const { addPhoto } = usePhotoStore();
  const navigate = useNavigate();

  if (user?.role !== 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setLogo(dataUrl);
      await addPhoto(file);
    };
    reader.readAsDataURL(file);
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setFavicon(dataUrl);
      await addPhoto(file);
    };
    reader.readAsDataURL(file);
  };

  // Notification states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  
  // Security states
  const [mfaEnabled, setMfaEnabled] = useState(false);
  
  // Accessibility states
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  
  // Message states
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [defaultLanguage, setDefaultLanguageState] = useState<AppLanguage>(getSystemDefaultLanguage());
  const [defaultLanguageSaved, setDefaultLanguageSaved] = useState(false);
  const [isSavingDefaultLanguage, setIsSavingDefaultLanguage] = useState(false);

  const changeLanguage = (lng: AppLanguage) => {
    void i18n.changeLanguage(lng);
    setPreferredLanguage(lng);
  };

  useEffect(() => {
    let active = true;

    const loadDefaultLanguage = async () => {
      try {
        const savedLanguage = await getDefaultLanguageSetting();
        if (active && savedLanguage) {
          setDefaultLanguageState(savedLanguage);
          setSystemDefaultLanguage(savedLanguage);
        }
      } catch {
        // Fall back to the cached default language when the shared setting is unavailable.
      }
    };

    void loadDefaultLanguage();

    return () => {
      active = false;
    };
  }, []);

  const handleSetDefaultLanguage = async () => {
    setIsSavingDefaultLanguage(true);

    try {
      await saveDefaultLanguageSetting(defaultLanguage);
      setSystemDefaultLanguage(defaultLanguage);
      setPreferredLanguage(defaultLanguage);
      await i18n.changeLanguage(defaultLanguage);
      setDefaultLanguageSaved(true);
      setTimeout(() => setDefaultLanguageSaved(false), 2000);
    } finally {
      setIsSavingDefaultLanguage(false);
    }
  };

  const handleSaveSettings = () => {
    setSettingsSuccess(true);
    setTimeout(() => {
      setSettingsSuccess(false);
      navigate(ROUTES.DASHBOARD);
    }, 1500);
  };

  const activeSessions = [
    { id: 1, device: 'Chrome / Windows 11', location: 'Kigali, RW', current: true },
    { id: 2, device: 'Safari / iPhone 15', location: 'Rubavu, RW', current: false },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('nav.settings')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Navigation Sidebar inside settings */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-1 shadow-xs">
            <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-sda-blue dark:text-sda-gold bg-sda-blue/5 dark:bg-sda-gold/10 flex items-center gap-2">
              <SettingsIcon size={16} /> {t('settings.general')}
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Shield size={16} /> {t('settings.security')}
            </button>
            <button className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
              <Bell size={16} /> {t('settings.notificationRules')}
            </button>
          </div>
        </div>

        {/* Settings Main Content Area */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Appearance & Localization */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Languages size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('settings.appearanceLocalization')}
            </h3>
            
            {/* Theme switcher */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.themeMode')}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t('settings.themeDesc')}</p>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                {theme === 'light' ? (
                  <>
                    <Moon size={14} className="text-slate-400" />
                    {t('settings.darkMode')}
                  </>
                ) : (
                  <>
                    <Sun size={14} className="text-sda-gold" />
                    {t('settings.lightMode')}
                  </>
                )}
              </button>
            </div>

            {/* Language switcher */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.interfaceLanguage')}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t('settings.languageDesc')}</p>
              </div>
              <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => changeLanguage('en')}
                  className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    i18n.language === 'en'
                      ? 'bg-white dark:bg-slate-700 text-sda-blue dark:text-sda-gold font-extrabold shadow-xs'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                    {t('settings.langEn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => changeLanguage('rw')}
                    className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      i18n.language === 'rw'
                        ? 'bg-white dark:bg-slate-700 text-sda-blue dark:text-sda-gold font-extrabold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {t('settings.langRw')}
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.defaultLanguage')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.defaultLanguageDesc')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setDefaultLanguageState('en')}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        defaultLanguage === 'en'
                          ? 'bg-white dark:bg-slate-700 text-sda-blue dark:text-sda-gold font-extrabold shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t('settings.langEn')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDefaultLanguageState('rw')}
                      className={`text-[10px] font-extrabold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        defaultLanguage === 'rw'
                          ? 'bg-white dark:bg-slate-700 text-sda-blue dark:text-sda-gold font-extrabold shadow-xs'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {t('settings.langRw')}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSetDefaultLanguage}
                    disabled={isSavingDefaultLanguage}
                    className="bg-sda-blue hover:bg-sda-blue-dark disabled:cursor-not-allowed disabled:opacity-60 dark:bg-sda-gold dark:hover:bg-sda-gold-light dark:text-sda-blue font-bold text-white text-[10px] px-4 py-2 rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {t('settings.setDefaultLanguage')}
                  </button>
                </div>
              </div>
              {defaultLanguageSaved && (
                <p className="mt-3 text-[10px] font-semibold text-green-600 dark:text-green-400">
                  {t('settings.defaultLanguageSaved')}
                </p>
              )}
            </div>

            {/* Logo customization */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.mifemLogo')}</p>
              <p className="text-[10px] text-slate-400 font-medium">{t('settings.logoDesc')}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {logoDataUrl ? (
                    <img src={logoDataUrl} alt={t('settings.customLogoAlt')} className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-400 font-bold">?</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white hover:bg-sda-blue-dark transition-all">
                    <ImageUp size={14} />
                    {logoDataUrl ? t('settings.changeLogo') : t('settings.uploadLogo')}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {logoDataUrl && (
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      {t('settings.remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Favicon (Title logo) customization */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.faviconTitle')}</p>
              <p className="text-[10px] text-slate-400 font-medium">{t('settings.faviconDesc')}</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                  {faviconDataUrl ? (
                    <img src={faviconDataUrl} alt={t('settings.customFaviconAlt')} className="w-full h-full object-contain" />
                  ) : (
                    <img src="/upload/mifem.png" alt={t('settings.customFaviconAlt')} className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex gap-2">
                  <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-sda-blue px-4 py-2 text-xs font-bold text-white hover:bg-sda-blue-dark transition-all">
                    <ImageUp size={14} />
                    {faviconDataUrl ? t('settings.changeFavicon') : t('settings.uploadFavicon')}
                    <input type="file" accept="image/*" onChange={handleFaviconUpload} className="hidden" />
                  </label>
                  {faviconDataUrl && (
                    <button
                      type="button"
                      onClick={removeFavicon}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-900/50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                      {t('settings.remove')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Bell size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('settings.notifications')}
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.emailAlerts')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.emailAlertsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.smsAlerts')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.smsAlertsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.weeklyDigest')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.weeklyDigestDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
                />
              </label>
            </div>
          </div>

          {/* Security & Active Sessions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('settings.securitySection')}
            </h3>

            {/* MFA checkbox */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.mfa')}</p>
                <p className="text-[10px] text-slate-400 font-medium">{t('settings.mfaDesc')}</p>
              </div>
              <input
                type="checkbox"
                checked={mfaEnabled}
                onChange={(e) => setMfaEnabled(e.target.checked)}
                className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
              />
            </div>

            {/* Session Management */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.activeSessions')}</p>
              <div className="space-y-2">
                {activeSessions.map((session) => (
                  <div key={session.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{session.device}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{session.location}</p>
                    </div>
                    {session.current ? (
                      <span className="text-[10px] font-extrabold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        {t('settings.currentSession')}
                      </span>
                    ) : (
                      <button type="button" className="text-[10px] font-bold text-red-600 hover:underline">
                        {t('settings.terminate')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-5">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Eye size={18} className="text-sda-blue dark:text-sda-gold" />
              {t('settings.accessibility')}
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.highContrast')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.highContrastDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => setHighContrast(e.target.checked)}
                  className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.largeFonts')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.largeFontsDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={largeText}
                  onChange={(e) => setLargeText(e.target.checked)}
                  className="rounded border-slate-300 text-sda-blue focus:ring-sda-blue h-4 w-4"
                />
              </label>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{t('settings.fontSize')}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{t('settings.fontSizeDesc')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decreaseFontSize}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer font-bold"
                    disabled={fontSize <= 12}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-sm font-bold text-slate-800 dark:text-slate-200 w-8 text-center">{fontSize}</span>
                  <button
                    type="button"
                    onClick={increaseFontSize}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer font-bold"
                    disabled={fontSize >= 24}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2 border border-green-200 dark:border-green-900/50">
              <CheckCircle2 size={16} /> {t('settings.savedSuccess')}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="bg-sda-blue hover:bg-sda-blue-dark dark:bg-sda-gold dark:hover:bg-sda-gold-light dark:text-sda-blue font-bold text-white text-xs px-5 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {t('settings.saveConfig')}
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default Settings;
