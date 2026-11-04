import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTES } from '@/constants/routes';
import { MOCK_FIELDS } from '@/data/enterpriseMocks';
import {
  useManagedUsers,
  useUpdateUserRole,
  useUpdateUserStatus,
  useUpdateUserDetails,
  useDeleteUser,
} from '@/hooks/useAdminUsers';
import type { AccountStatus, ManagedUser } from '@/types/admin';
import type { UserRole } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { getTranslatedRoleLabel } from '@/lib/roles';
import {
  Users,
  ChevronDown,
  Edit3,
  Trash2,
  X,
  Check,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';

const ROLES: UserRole[] = ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'];

interface UsersDropdownProps {
  selectedFieldId: string;
}

export default function UsersDropdown({ selectedFieldId }: UsersDropdownProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: users, isLoading } = useManagedUsers();
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const updateDetails = useUpdateUserDetails();
  const deleteUser = useDeleteUser();

  // Edit state
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditUser(null);
        setDeleteId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fieldUsers = (users ?? []).filter(
    (u) => (!selectedFieldId || u.fieldId === selectedFieldId)
  );

  const fieldName = selectedFieldId
    ? MOCK_FIELDS.find(f => f.id === selectedFieldId)?.name || 'Unknown Field'
    : 'All Fields';

  const handleEditSave = async () => {
    if (!editUser) return;
    await updateDetails.mutateAsync({ id: editUser.id, ...editForm });
    setEditUser(null);
  };

  const handleDelete = async (id: string) => {
    await deleteUser.mutateAsync(id);
    setDeleteId(null);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-xl bg-sda-blue/10 dark:bg-sda-blue/20 px-3 py-1.5 text-xs font-bold text-sda-blue dark:text-sda-gold hover:bg-sda-blue/20 dark:hover:bg-sda-blue/30 transition-all whitespace-nowrap"
      >
        <Users size={14} />
        <span>{t('nav.adminUsers')}</span>
        <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-sda-blue dark:bg-sda-gold text-white dark:text-sda-blue text-[9px] font-extrabold px-1">
          {fieldUsers.length}
        </span>
        <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-2 w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Users size={14} className="text-sda-blue dark:text-sda-gold" />
                <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                  {t('nav.adminUsers')}
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  — {fieldName}
                </span>
              </div>
              <span className="flex items-center justify-center min-w-[22px] h-[22px] rounded-full bg-sda-blue/10 dark:bg-sda-gold/20 text-sda-blue dark:text-sda-gold text-[10px] font-extrabold px-1.5">
                {fieldUsers.length}
              </span>
            </div>

            {/* User list */}
            <div className="max-h-[320px] overflow-y-auto">
              {isLoading ? (
                <div className="p-6 text-center text-xs text-slate-400 font-semibold">{t('common.loading')}</div>
              ) : fieldUsers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-semibold">No users found</div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fieldUsers.map((u) => (
                    <div key={u.id} className="px-4 py-2.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      {editUser?.id === u.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold outline-none focus:ring-1 focus:ring-sda-blue"
                          />
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold outline-none focus:ring-1 focus:ring-sda-blue"
                          />
                          <div className="flex gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => setEditUser(null)}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={handleEditSave}
                              disabled={updateDetails.isPending}
                              className="px-2.5 py-1 rounded-lg bg-sda-blue text-white text-[10px] font-bold hover:bg-sda-blue-dark disabled:opacity-50 cursor-pointer"
                            >
                              <Check size={12} />
                            </button>
                          </div>
                        </div>
                      ) : deleteId === u.id ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={14} className="text-red-500 shrink-0" />
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {t('admin.deleteConfirmation', { name: u.name })}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setDeleteId(null)}
                              className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                            >
                              {t('common.cancel')}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(u.id)}
                              disabled={deleteUser.isPending}
                              className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                            >
                              {t('admin.confirmDelete')}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-extrabold text-slate-900 dark:text-white truncate">{u.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium truncate">{u.email}</p>
                          </div>
                          <select
                            value={u.role}
                            disabled={updateRole.isPending}
                            onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-sda-blue max-w-[100px]"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{getTranslatedRoleLabel(r, t)}</option>
                            ))}
                          </select>
                          <select
                            value={u.status}
                            disabled={updateStatus.isPending}
                            onChange={(e) => updateStatus.mutate({ id: u.id, status: e.target.value as AccountStatus })}
                            className={cn(
                              "rounded-lg border px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 max-w-[85px]",
                              u.status === 'ACTIVE' && "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
                              u.status === 'SUSPENDED' && "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
                              u.status === 'LOCKED' && "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-500 dark:border-amber-900/30",
                              u.status === 'INVITED' && "border-sda-blue/20 bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold-light dark:border-sda-gold/20"
                            )}
                          >
                            {(['ACTIVE', 'INVITED', 'SUSPENDED', 'LOCKED'] as const).map((s) => (
                              <option key={s} value={s}>{t('admin.status_' + s)}</option>
                            ))}
                          </select>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email }); }}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-sda-blue transition-colors cursor-pointer"
                              title={t('admin.editDetails')}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteId(u.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                              title={t('admin.deleteUser')}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer action */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="text-[10px] font-semibold text-slate-400">
                {fieldUsers.length} users
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate(selectedFieldId ? `/admin/users?fieldId=${selectedFieldId}` : ROUTES.ADMIN_USERS);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-sda-blue px-3 py-1.5 text-[10px] font-bold text-white hover:bg-sda-blue-dark transition-colors cursor-pointer"
              >
                {t('admin.title')}
                <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
