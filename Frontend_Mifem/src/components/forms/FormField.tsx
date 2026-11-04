import React from 'react';
import { AlertCircle } from 'lucide-react';

export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <div className="flex items-center gap-3 pb-1">
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sda-blue to-sda-blue-dark text-white shadow-md shadow-sda-blue/20 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <h3 className="font-bold text-lg text-slate-800 dark:text-white tracking-tight">{title}</h3>
      {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, required, error, hint, children, className }) => (
  <div className={className}>
    <label className="flex items-baseline gap-1 text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label}
      {required && <span className="text-red-400 text-sm leading-none">*</span>}
      {hint && (
        <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
          ({hint})
        </span>
      )}
    </label>
    {children}
    {error && (
      <p className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1" role="alert">
        <AlertCircle size={12} className="shrink-0" /> {error}
      </p>
    )}
  </div>
);
