import React from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface ExportMenuProps {
  onExport: (format: 'csv' | 'pdf' | 'xlsx') => void;
  className?: string;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, className, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className={cn('inline-flex rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onExport('csv')}
        className="flex items-center gap-1.5 rounded-l-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FileSpreadsheet size={14} aria-hidden />
        {t('common.exportCsv')}
      </button>
      <div className="w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onExport('xlsx')}
        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <Download size={14} aria-hidden />
        {t('common.exportXlsx')}
      </button>
      <div className="w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={() => onExport('pdf')}
        className="flex items-center gap-1.5 rounded-r-xl px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <FileText size={14} aria-hidden />
        {t('common.exportPdf')}
      </button>
    </div>
  );
};

export default ExportMenu;
