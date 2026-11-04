import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import { useFields } from '@/services/locationService';
import { Building2, Globe, ChevronRight, ArrowLeft } from 'lucide-react';

const UserScopeSelect: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [showFields, setShowFields] = useState(false);
  const { data: fieldsData } = useFields({ limit: 100 });
  const fields = (fieldsData?.data ?? []) as Array<{ id: string; name: string; code?: string }>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Union Card */}
        <motion.button
          type="button"
          onClick={() => navigate('/admin/users?scope=union')}
          className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-sda-blue hover:shadow-xl hover:shadow-sda-blue/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sda-gold dark:hover:shadow-sda-gold/10 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sda-blue/5 dark:bg-sda-gold/5" />
          <Globe size={40} className="text-sda-blue dark:text-sda-gold mb-4" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Union
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Manage users at the Union level — oversee leaders and administrators across all fields.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-sda-blue dark:text-sda-gold">
            {t('common.continue')}
            <ChevronRight size={16} className="transition-transform group-hover:translate-x-1" />
          </div>
        </motion.button>

        {/* Fields Card */}
        <motion.button
          type="button"
          onClick={() => setShowFields(!showFields)}
          className="group relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-8 text-left shadow-sm transition-all hover:border-sda-blue hover:shadow-xl hover:shadow-sda-blue/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sda-gold dark:hover:shadow-sda-gold/10 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-sda-blue/5 dark:bg-sda-gold/5" />
          <Building2 size={40} className="text-sda-blue dark:text-sda-gold mb-4" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2">
            Fields
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Manage users within a specific Field — manage district and church-level users.
          </p>
          <div className="mt-4 flex items-center gap-1 text-sm font-bold text-sda-blue dark:text-sda-gold">
            {showFields ? 'Collapse' : 'Select Field'}
            <ChevronRight size={16} className={`transition-transform ${showFields ? 'rotate-90' : ''} group-hover:translate-x-1`} />
          </div>
        </motion.button>
      </div>

      {/* Field Selection Grid */}
      <AnimatePresence>
        {showFields && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Select a Field
                </h4>
                <button
                  type="button"
                  onClick={() => setShowFields(false)}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fields.map((field) => (
                  <motion.button
                    key={field.id}
                    type="button"
                    onClick={() => navigate(`/admin/users?fieldId=${field.id}`)}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-sm font-bold text-slate-700 shadow-xs transition-all hover:border-sda-blue hover:bg-sda-blue/5 hover:text-sda-blue dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:border-sda-gold dark:hover:bg-sda-gold/5 dark:hover:text-sda-gold cursor-pointer"
                    whileHover={{ x: 4 }}
                  >
                    <Building2 size={18} className="shrink-0 text-slate-400 dark:text-slate-500" />
                    <span className="truncate">{field.name}</span>
                    <ChevronRight size={14} className="ml-auto shrink-0 text-slate-400" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserScopeSelect;
