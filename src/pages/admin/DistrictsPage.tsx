import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import {
  useDistricts, useCreateDistrict, useUpdateDistrict, useDeleteDistrict,
  useFields, District,
} from '@/services/locationService';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit3, Trash2, X, Check, Map } from 'lucide-react';

const DistrictsPage = () => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useDistricts({ search, page, limit: 20 });
  const { data: fields } = useFields({ limit: 100 });
  const createDistrict = useCreateDistrict();
  const updateDistrict = useUpdateDistrict();
  const deleteDistrict = useDeleteDistrict();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<District | null>(null);
  const [form, setForm] = useState({ name: '', code: '', fieldId: '', status: 'ACTIVE' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', fieldId: fields?.data?.[0]?.id || '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (d: District) => {
    setEditItem(d);
    setForm({ name: d.name, code: d.code || '', fieldId: d.fieldId, status: d.status || 'ACTIVE' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editItem) {
      await updateDistrict.mutateAsync({ id: editItem.id, ...form });
    } else {
      await createDistrict.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDistrict.mutateAsync(id);
    setDeleteId(null);
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Districts"
        subtitle="Manage SDA districts within mission fields"
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark transition-colors">
            <Plus size={18} />
            New District
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search districts..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {isLoading ? (
        <LoadingBlock label="Loading districts..." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Field</th>
                <th className="px-5 py-4">Churches</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.data.map((d) => (
                <tr key={d.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{d.name}</td>
                  <td className="px-5 py-4 text-slate-500">{d.code || '—'}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{d.field?.name || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Map size={14} />
                      {d.churches?.length || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', d.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', d.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400')} />
                      {d.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sda-blue dark:hover:bg-slate-800 dark:hover:text-sda-gold-light" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDeleteId(d.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No districts found</td>
                </tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-800">
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800">Previous</button>
                <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800">Next</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editItem ? 'Edit District' : 'New District'}</h2>
                <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. Kigali City District" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. KCD" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Field</label>
                  <select value={form.fieldId} onChange={(e) => setForm(p => ({ ...p, fieldId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {fields?.data?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={handleSave} disabled={createDistrict.isPending || updateDistrict.isPending || !form.name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark disabled:opacity-50 transition-colors">
                  <Check size={18} />
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setDeleteId(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete District?</h2>
              <p className="mt-2 text-sm text-slate-500">This action cannot be undone. All churches under this district will also be affected.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} disabled={deleteDistrict.isPending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DistrictsPage;
