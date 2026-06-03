import React from 'react';
import { QrCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface QRCheckInPanelProps {
  token: string;
  title?: string;
}

const QRCheckInPanel: React.FC<QRCheckInPanelProps> = ({ token, title }) => {
  const { t } = useTranslation();
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(token)}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center gap-2">
        <QrCode className="text-sda-blue" size={22} aria-hidden />
        <h3 className="font-bold text-slate-900 dark:text-white">{title ?? t('attendance.qrTitle')}</h3>
      </div>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">{t('attendance.qrHint')}</p>
      <div className="flex flex-col items-center gap-3">
        <img
          src={src}
          alt=""
          width={200}
          height={200}
          className="rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700"
        />
        <code className="max-w-full break-all rounded-lg bg-slate-100 px-3 py-2 text-center text-[10px] font-mono text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {token}
        </code>
      </div>
    </motion.div>
  );
};

export default QRCheckInPanel;
