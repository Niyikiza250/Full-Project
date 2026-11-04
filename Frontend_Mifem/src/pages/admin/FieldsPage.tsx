import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import {
  useFields, useCreateField, useUpdateField, useDeleteField,
  useUnions, Field,
} from '@/services/locationService';
import { cn } from '@/lib/utils';
import { Plus, Search, Edit3, Trash2, X, Check, Map } from 'lucide-react';

const FieldsPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useFields({ search, page, limit: 20 });
  const { data: unions } = useUnions();
  const createField = useCreateField();
  const updateField = useUpdateField();
  const deleteField = useDeleteField();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Field | null>(null);
  const [form, setForm] = useState<{ name: string; code: string; unionId: string; status: 'ACTIVE' | 'INACTIVE' }>({ name: '', code: '', unionId: '', status: 'ACTIVE' });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: '', code: '', unionId: unions?.[0]?.id || '', status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEdit = (f: Field) => {
    setEditItem(f);
    setForm({ name: f.name, code: f.code || '', unionId: f.unionId, status: f.status || 'ACTIVE' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    if (editItem) {
      await updateField.mutateAsync({ id: editItem.id, ...form });
    } else {
      await createField.mutateAsync(form);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteField.mutateAsync(id);
    setDeleteId(null);
  };

  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fields"
        subtitle="Manage SDA mission fields"
        actions={
          <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark transition-colors">
            <Plus size={18} />
            New Field
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search fields..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {isLoading ? (
        <LoadingBlock label="Loading fields..." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Union</th>
                <th className="px-5 py-4">Districts</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.data.map((f) => (
                <tr key={f.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{f.name}</td>
                  <td className="px-5 py-4 text-slate-500">{f.code || '—'}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{f.union?.name || '—'}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 text-slate-500">
                      <Map size={14} />
                      {f.districts?.length || 0}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', f.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', f.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400')} />
                      {f.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(f)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sda-blue dark:hover:bg-slate-800 dark:hover:text-sda-gold-light" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDeleteId(f.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No fields found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
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
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editItem ? 'Edit Field' : 'New Field'}</h2>
                <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. Central Rwanda Field" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. CRF" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Union</label>
                  <select value={form.unionId} onChange={(e) => setForm(p => ({ ...p, unionId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {unions?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
                  <select value={form.status} onChange={(e) => setForm(p => ({ ...p, status: e.target.value as 'ACTIVE' | 'INACTIVE' }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={handleSave} disabled={createField.isPending || updateField.isPending || !form.name.trim()} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark disabled:opacity-50 transition-colors">
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Field?</h2>
              <p className="mt-2 text-sm text-slate-500">This action cannot be undone. All districts under this field will also be affected.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} disabled={deleteField.isPending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
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

export default FieldsPage;
