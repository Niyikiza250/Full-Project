import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import {
  useChurches, useCreateChurch, useUpdateChurch, useDeleteChurch,
  useDistricts, useFields, useNearbyChurches, Church,
} from '@/services/locationService';
import { cn } from '@/lib/utils';
import {
  Plus, Search, Edit3, Trash2, X, Check, MapPin,
  Navigation, Globe, Crosshair,
} from 'lucide-react';

const ChurchesPage = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showNearby, setShowNearby] = useState(false);
  const [nearbyLat, setNearbyLat] = useState('-1.9441');
  const [nearbyLng, setNearbyLng] = useState('30.0619');
  const [nearbyRadius, setNearbyRadius] = useState('10');

  const { data, isLoading } = useChurches({ search, page, limit: 20 });
  const { data: fields } = useFields({ limit: 100 });
  const { data: districts } = useDistricts({ limit: 500 });
  const { data: nearbyChurches, isLoading: nearbyLoading } = useNearbyChurches(
    parseFloat(nearbyLat), parseFloat(nearbyLng),
    nearbyRadius ? parseInt(nearbyRadius, 10) : undefined,
  );

  const createChurch = useCreateChurch();
  const updateChurch = useUpdateChurch();
  const deleteChurch = useDeleteChurch();

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Church | null>(null);
  const [form, setForm] = useState({
    name: '', code: '', districtId: '', fieldId: '',
    address: '', latitude: '', longitude: '', status: 'ACTIVE',
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openCreate = () => {
    setEditItem(null);
    const firstDistrict = districts?.data?.[0];
    setForm({
      name: '', code: '', districtId: firstDistrict?.id || '',
      fieldId: firstDistrict?.fieldId || '',
      address: '', latitude: '', longitude: '', status: 'ACTIVE',
    });
    setModalOpen(true);
  };

  const openEdit = (c: Church) => {
    setEditItem(c);
    setForm({
      name: c.name, code: c.code || '', districtId: c.districtId,
      fieldId: c.fieldId || c.district?.fieldId || '',
      address: c.address || '', latitude: c.latitude?.toString() || '',
      longitude: c.longitude?.toString() || '', status: c.status || 'ACTIVE',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.districtId) return;
    const payload = {
      name: form.name,
      code: form.code || undefined,
      districtId: form.districtId,
      fieldId: form.fieldId || undefined,
      address: form.address || undefined,
      latitude: form.latitude ? parseFloat(form.latitude) : undefined,
      longitude: form.longitude ? parseFloat(form.longitude) : undefined,
      status: form.status,
    };
    if (editItem) {
      await updateChurch.mutateAsync({ id: editItem.id, ...payload });
    } else {
      await createChurch.mutateAsync(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteChurch.mutateAsync(id);
    setDeleteId(null);
  };

  const totalPages = data?.totalPages || 1;

  const selectedDistrict = districts?.data?.find((d) => d.id === form.districtId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Churches"
        subtitle="Manage SDA churches and explore nearby locations"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setShowNearby(!showNearby)}
              className={cn('inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors', showNearby ? 'bg-sda-blue text-white border-sda-blue' : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800')}
            >
              <Crosshair size={18} />
              Nearby
            </button>
            <button onClick={openCreate} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark transition-colors">
              <Plus size={18} />
              New Church
            </button>
          </div>
        }
      />

      {/* Nearby Search Panel */}
      <AnimatePresence>
        {showNearby && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Find Churches Nearby</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Latitude</label>
                  <input type="number" step="any" value={nearbyLat} onChange={(e) => setNearbyLat(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Longitude</label>
                  <input type="number" step="any" value={nearbyLng} onChange={(e) => setNearbyLng(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Radius (km)</label>
                  <input type="number" min="1" value={nearbyRadius} onChange={(e) => setNearbyRadius(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" />
                </div>
                <div className="flex items-end">
                  <p className="text-xs text-slate-400">Defaults: Kigali city center (-1.9441, 30.0619)</p>
                </div>
              </div>

              {nearbyLoading ? (
                <LoadingBlock label="Searching nearby churches..." className="min-h-[100px]" />
              ) : nearbyChurches && nearbyChurches.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{nearbyChurches.length} church(es) found nearby</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {nearbyChurches.map((c) => (
                      <div key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-slate-500">{c.district?.name || '—'}</p>
                          </div>
                          {c.latitude && c.longitude && (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-sda-blue hover:bg-sda-blue/10 transition-colors"
                              title="Get directions"
                            >
                              <Navigation size={16} />
                            </a>
                          )}
                        </div>
                        {c.address && <p className="mt-1 text-xs text-slate-400">{c.address}</p>}
                        {c.latitude && c.longitude && (
                          <p className="mt-1 text-xs text-slate-400">
                            {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">No churches found in this area. Try increasing the radius.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search churches..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingBlock label="Loading churches..." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">District</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {data?.data.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{c.name}</td>
                  <td className="px-5 py-4 text-slate-500">{c.code || '—'}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{c.district?.name || '—'}</td>
                  <td className="px-5 py-4">
                    {c.latitude && c.longitude ? (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <MapPin size={14} />
                        {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', c.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400')}>
                      <span className={cn('h-1.5 w-1.5 rounded-full', c.status === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-400')} />
                      {c.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {c.latitude && c.longitude && (
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sda-blue dark:hover:bg-slate-800"
                          title="Directions"
                        >
                          <Navigation size={16} />
                        </a>
                      )}
                      <button onClick={() => openEdit(c)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-sda-blue dark:hover:bg-slate-800 dark:hover:text-sda-gold-light" title="Edit">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/20" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No churches found</td>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" onClick={() => setModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 my-8" onClick={(e) => e.stopPropagation()}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{editItem ? 'Edit Church' : 'New Church'}</h2>
                <button onClick={() => setModalOpen(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={20} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                  <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. Kigali Central SDA Church" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Code</label>
                  <input type="text" value={form.code} onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="e.g. KCC" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">District</label>
                  <select value={form.districtId} onChange={(e) => {
                    const d = districts?.data?.find((dist) => dist.id === e.target.value);
                    setForm(p => ({ ...p, districtId: e.target.value, fieldId: d?.fieldId || '' }));
                  }} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {districts?.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Field (auto-filled from district)</label>
                  <select value={form.fieldId} onChange={(e) => setForm(p => ({ ...p, fieldId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    {fields?.data?.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                  <input type="text" value={form.address} onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="Street address" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Latitude</label>
                    <input type="number" step="any" value={form.latitude} onChange={(e) => setForm(p => ({ ...p, latitude: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="-1.9441" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Longitude</label>
                    <input type="number" step="any" value={form.longitude} onChange={(e) => setForm(p => ({ ...p, longitude: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-sda-blue focus:ring-2 focus:ring-sda-blue/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white" placeholder="30.0619" />
                  </div>
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
                <button onClick={handleSave} disabled={createChurch.isPending || updateChurch.isPending || !form.name.trim() || !form.districtId} className="inline-flex items-center gap-2 rounded-xl bg-sda-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-sda-blue-dark disabled:opacity-50 transition-colors">
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Delete Church?</h2>
              <p className="mt-2 text-sm text-slate-500">This action cannot be undone.</p>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
                <button onClick={() => handleDelete(deleteId)} disabled={deleteChurch.isPending} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
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

export default ChurchesPage;
