import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '@/components/ui/PageHeader';
import LoadingBlock from '@/components/ui/LoadingBlock';
import ExportMenu from '@/components/ui/ExportMenu';
import {
  useManagedUsers,
  useAuditLogs,
  useAdminActivity,
  useUpdateUserRole,
  useUpdateUserStatus,
  useInviteUser,
  useSetUserPermissions,
  useUpdateUserDetails,
  useDeleteUser,
  useResetPassword,
  useBulkImportUsers,
} from '@/hooks/useAdminUsers';
import { PERMISSION_GROUPS } from '@/types/admin';
import type { AccountStatus, ManagedUser } from '@/types/admin';
import type { UserRole } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { getTranslatedRoleLabel } from '@/lib/roles';
import { 
  KeyRound, Shield, FileSpreadsheet, ToggleLeft, ToggleRight, Trash2, 
  Edit3, AlertTriangle, CheckCircle, XCircle, Info, RefreshCw, Copy, Download
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { ROUTES } from '@/constants/routes';

const ROLES: UserRole[] = ['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'];

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user: currentUser, excelImportAllowedRoles = ['ADMIN'], toggleExcelImportPermission } = useAuthStore();

  if (currentUser?.role !== 'SUPER_ADMIN') {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }
  const { data: users, isLoading: lu } = useManagedUsers();
  const { data: audit, isLoading: la } = useAuditLogs();
  const { data: activity, isLoading: lac } = useAdminActivity();
  
  const updateRole = useUpdateUserRole();
  const updateStatus = useUpdateUserStatus();
  const invite = useInviteUser();
  const setPerms = useSetUserPermissions();
  const updateDetails = useUpdateUserDetails();
  const deleteUser = useDeleteUser();
  const resetPassword = useResetPassword();
  const bulkImport = useBulkImportUsers();

  // Search & Filtering
  const [search, setSearch] = useState('');
  
  // Custom Modals / States
  const [banner, setBanner] = useState<string | null>(null);
  const [permUser, setPermUser] = useState<ManagedUser | null>(null);
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  
  // Edit User State
  const [editUser, setEditUser] = useState<ManagedUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  
  // Delete User State
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<ManagedUser | null>(null);

  // Invite User State
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'MEMBER' as UserRole });

  // Reset Password State
  const [resetConfirmUser, setResetConfirmUser] = useState<ManagedUser | null>(null);
  const [resetTempPassword, setResetTempPassword] = useState<string | null>(null);

  // Excel Bulk Import States
  const [excelModalOpen, setExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<Array<{ name: string; email: string; role: UserRole }> | null>(null);
  const [excelErrors, setExcelErrors] = useState<string[] | null>(null);
  const [importResultCredentials, setImportResultCredentials] = useState<Array<{ name: string; email: string; tempPass: string }> | null>(null);

  // Check if current user is allowed to upload Excel
  const isExcelUploadAllowed = currentUser && excelImportAllowedRoles.includes(currentUser.role);

  const filtered = (users ?? []).filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openPerms = (u: ManagedUser) => {
    setPermUser(u);
    setSelectedPerms([...u.permissions]);
  };

  const togglePerm = (p: string) => {
    setSelectedPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const savePerms = async () => {
    if (!permUser) return;
    await setPerms.mutateAsync({ id: permUser.id, permissions: selectedPerms });
    setPermUser(null);
    triggerBanner(t('common.success'));
  };

  const triggerBanner = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  };

  // CSV Export
  const exportUsers = () => {
    const header = 'name,email,role,status,mfa';
    const rows = (users ?? []).map((u) => `${u.name},${u.email},${u.role},${u.status},${u.mfaEnabled}`).join('\n');
    const blob = new Blob([`${header}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock File Reader & Parser for Excel/CSV
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setExcelErrors([t('admin.formatError')]);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setExcelErrors([t('admin.fileTooLarge')]);
      return;
    }

    setExcelFile(file);
    setExcelErrors(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      if (lines.length < 2) {
        setExcelErrors([t('admin.noDataRows')]);
        return;
      }

      // Read Header Row
      const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
      const nameIndex = headers.indexOf('name');
      const emailIndex = headers.indexOf('email');
      const roleIndex = headers.indexOf('role');

      if (nameIndex === -1 || emailIndex === -1) {
        setExcelErrors([t('admin.missingColumns')]);
        return;
      }

      const parsedRows: Array<{ name: string; email: string; role: UserRole }> = [];
      const validationErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const rowName = columns[nameIndex];
        const rowEmail = columns[emailIndex];
        let rowRole = (roleIndex !== -1 ? columns[roleIndex]?.toUpperCase() : 'MEMBER') as UserRole;

        if (!ROLES.includes(rowRole)) {
          rowRole = 'MEMBER';
        }

        if (!rowName || !rowEmail) {
          validationErrors.push(t('admin.rowMissingFields', { row: i + 1 }));
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(rowEmail)) {
          validationErrors.push(t('admin.rowInvalidEmail', { row: i + 1, email: rowEmail }));
          continue;
        }

        if (users?.some(u => u.email.toLowerCase() === rowEmail.toLowerCase())) {
          validationErrors.push(t('admin.rowDuplicateEmail', { row: i + 1, email: rowEmail }));
          continue;
        }

        parsedRows.push({ name: rowName, email: rowEmail, role: rowRole });
      }

      if (validationErrors.length > 0) {
        setExcelErrors(validationErrors);
      }
      setExcelPreview(parsedRows);
    };

    // Treat as plain text CSV for simulation simplicity
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (!excelPreview || excelPreview.length === 0) return;
    
    try {
      const res = await bulkImport.mutateAsync(excelPreview);
      setImportResultCredentials(res);
      setExcelFile(null);
      setExcelPreview(null);
      setExcelErrors(null);
    } catch (err: any) {
      setExcelErrors([err?.message || t('admin.bulkRegistrationFailed')]);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
        actions={
          <div className="flex flex-wrap gap-2">
            <ExportMenu
              onExport={(f) => {
                if (f === 'csv') exportUsers();
                else {
                  triggerBanner(`${f.toUpperCase()} (demo)`);
                }
              }}
              disabled={!users?.length}
            />
            {isExcelUploadAllowed && (
              <button
                type="button"
                onClick={() => setExcelModalOpen(true)}
                className="rounded-xl bg-sda-gold text-sda-blue px-4 py-2 text-sm font-bold shadow hover:bg-sda-gold-light transition-all flex items-center gap-1.5"
              >
                <FileSpreadsheet size={16} />
                {t('admin.attachExcel')}
              </button>
            )}
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="rounded-xl bg-sda-blue px-4 py-2 text-sm font-bold text-white shadow hover:bg-sda-blue-dark transition-all"
            >
              {t('admin.addUser')}
            </button>
          </div>
        }
      />

      {banner && (
        <div role="status" className="rounded-lg bg-green-150 p-3 text-center text-xs font-semibold text-green-900 dark:bg-green-950/20 dark:text-green-400 border border-green-200 dark:border-green-900/30">
          {banner}
        </div>
      )}

      {/* System Toggle Options */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
          <Info size={16} className="text-sda-blue dark:text-sda-gold" />
          {t('admin.bulkRegistrationToggle')}
        </h3>
        <p className="text-[11px] text-slate-500">{t('admin.bulkRegistrationDesc')}</p>
        <div className="flex flex-wrap gap-4 pt-1">
          {ROLES.filter(r => r !== 'SUPER_ADMIN').map((role) => {
            const isAllowed = excelImportAllowedRoles.includes(role);
            return (
              <button
                key={role}
                onClick={() => toggleExcelImportPermission(role)}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:opacity-90"
              >
                {isAllowed ? (
                  <ToggleRight size={22} className="text-green-600 cursor-pointer" />
                ) : (
                  <ToggleLeft size={22} className="text-slate-400 cursor-pointer" />
                )}
                {getTranslatedRoleLabel(role, t)}
              </button>
            );
          })}
        </div>
      </div>

      {inviteOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm"
        >
          <h3 className="font-bold text-sm">{t('admin.addNewUserHeading')}</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <input
              placeholder={t('common.name')}
              value={inviteForm.name}
              onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue"
            />
            <input
              placeholder={t('common.email')}
              value={inviteForm.email}
              onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue"
            />
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value as UserRole }))}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-sda-blue"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {t('admin.role_' + r)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={invite.isPending}
              onClick={async () => {
                if (!inviteForm.name || !inviteForm.email) return;
                await invite.mutateAsync(inviteForm);
                setInviteOpen(false);
                setInviteForm({ name: '', email: '', role: 'MEMBER' });
                triggerBanner(t('common.success'));
              }}
              className="rounded-xl bg-sda-blue px-5 py-2 text-xs font-bold text-white disabled:opacity-50 transition-all cursor-pointer"
            >
              {t('common.save')}
            </button>
            <button type="button" onClick={() => setInviteOpen(false)} className="rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer">
              {t('common.cancel')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Main user registry search input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
        <input
          type="search"
          placeholder={t('admin.searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-sda-blue dark:border-slate-700 dark:bg-slate-800 text-slate-800 dark:text-white"
          aria-label={t('common.search')}
        />
      </div>

      {lu || !users ? (
        <LoadingBlock />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/10">
                <th className="p-4 font-bold">{t('admin.tableUser')}</th>
                <th className="p-4 font-bold">{t('admin.tableEmail')}</th>
                <th className="p-4 font-bold">{t('admin.tableRoleAssignment')}</th>
                <th className="p-4 font-bold">{t('admin.tableAccountStatus')}</th>
                <th className="p-4 font-bold">{t('admin.tableActionSuite')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                  <td className="p-4">
                    <p className="font-extrabold text-slate-900 dark:text-white">{u.name}</p>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={updateRole.isPending}
                      onChange={(e) => updateRole.mutate({ id: u.id, role: e.target.value as UserRole })}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-1 focus:ring-sda-blue"
                      aria-label={t('common.role')}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>
                          {t('admin.role_' + r)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <select
                      value={u.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) => updateStatus.mutate({ id: u.id, status: e.target.value as AccountStatus })}
                      className={cn(
                        "rounded-xl border px-3 py-1.5 text-xs font-bold outline-none focus:ring-1",
                        u.status === 'ACTIVE' && "border-green-200 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/30",
                        u.status === 'SUSPENDED' && "border-red-200 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30",
                        u.status === 'LOCKED' && "border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 dark:border-amber-900/30",
                        u.status === 'INVITED' && "border-sda-blue/20 bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold-light dark:border-sda-gold/20"
                      )}
                      aria-label={t('admin.accountStatus')}
                    >
                      {(['ACTIVE', 'INVITED', 'SUSPENDED', 'LOCKED'] as const).map((s) => (
                        <option key={s} value={s}>
                          {t('admin.status_' + s)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditUser(u);
                          setEditForm({ name: u.name, email: u.email });
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-sda-blue rounded-lg transition-colors cursor-pointer"
                        title={t('admin.editDetails')}
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => openPerms(u)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                        title={t('admin.editPermissions')}
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetConfirmUser(u)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-sda-gold rounded-lg transition-colors cursor-pointer"
                        title={t('admin.resetPassword')}
                      >
                        <KeyRound size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmUser(u)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title={t('admin.deleteUser')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200 dark:border-slate-800">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{t('admin.editUserHeading')}</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('admin.fullNameLabel')}</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full text-xs font-semibold px-4 py-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">{t('admin.emailLabel')}</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full text-xs font-semibold px-4 py-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer hover:bg-slate-200"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await updateDetails.mutateAsync({ id: editUser.id, ...editForm });
                  setEditUser(null);
                  triggerBanner(t('admin.userDetailsUpdated'));
                }}
                className="px-5 py-2 bg-sda-blue text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-sda-blue-dark"
              >
                {t('admin.saveUpdates')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {deleteConfirmUser && (
        <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200 dark:border-slate-850 text-center">
            <div className="mx-auto w-10 h-10 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{t('admin.deleteHeading')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('admin.deleteConfirmation', { name: deleteConfirmUser.name }) }} />
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteUser.mutateAsync(deleteConfirmUser.id);
                  setDeleteConfirmUser(null);
                  triggerBanner(t('admin.deleteSuccess'));
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer"
              >
                {t('admin.confirmDelete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetConfirmUser && (
        <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full p-6 rounded-2xl shadow-xl space-y-4 border border-slate-200 dark:border-slate-850">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">{t('admin.resetPasswordHeading')}</h3>
            
            {!resetTempPassword ? (
              <>
                <p className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: t('admin.resetPasswordDesc', { name: resetConfirmUser.name }) }} />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetConfirmUser(null)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const temp = await resetPassword.mutateAsync(resetConfirmUser.id);
                      setResetTempPassword(temp);
                    }}
                    className="px-5 py-2 bg-sda-gold text-sda-blue font-bold rounded-xl text-xs cursor-pointer hover:bg-sda-gold-light flex items-center gap-1.5"
                  >
                    {t('admin.generateTempPassword')}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl text-center">
                  <p className="text-[10px] text-green-700 dark:text-green-400 font-bold uppercase mb-1">{t('admin.tempPasswordGenerated')}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-mono font-extrabold text-lg select-all bg-white dark:bg-slate-800 px-3 py-1 rounded border tracking-widest text-slate-800 dark:text-white">
                      {resetTempPassword}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(resetTempPassword)}
                      className="p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg text-slate-500 cursor-pointer"
                      title={t('admin.copyPassword')}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 text-center leading-normal">{t('admin.resetPasswordComplete')}</p>
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setResetConfirmUser(null);
                      setResetTempPassword(null);
                      triggerBanner(t('admin.resetPasswordBanner'));
                    }}
                    className="px-6 py-2 bg-sda-blue text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {t('admin.done')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Excel upload Modal */}
      {excelModalOpen && (
        <div role="dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full p-6 rounded-2xl shadow-xl space-y-5 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <FileSpreadsheet className="text-sda-gold" size={18} />
              {t('admin.excelBulkRegistration')}
            </h3>

            {!importResultCredentials ? (
              <>
                <div className="space-y-4">
                  {/* File Pick Area */}
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center hover:border-sda-blue/30 transition-colors relative cursor-pointer">
                    <input
                      type="file"
                      accept=".csv, .xlsx"
                      onChange={handleExcelFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="space-y-2 flex flex-col items-center justify-center">
                      <div className="w-10 h-10 bg-slate-55 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                        <FileSpreadsheet size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        {excelFile ? excelFile.name : t('admin.excelDropPrompt')}
                      </p>
                      <p className="text-[10px] text-slate-400">{t('admin.excelMaxSizeHint')}</p>
                    </div>
                  </div>

                  {/* Errors Block */}
                  {excelErrors && (
                    <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl space-y-1.5 text-xs text-red-700 dark:text-red-400">
                      <div className="flex items-center gap-1 font-bold">
                        <XCircle size={14} /> {t('admin.validationWarnings')}
                      </div>
                      <ul className="list-disc pl-5 text-[10px] space-y-1">
                        {excelErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  {excelPreview && excelPreview.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-slate-450 uppercase flex items-center gap-1">
                        <CheckCircle className="text-green-600" size={12} />
                        {t('admin.importPreview', { count: excelPreview.length })}
                      </p>
                      <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800 max-h-[220px]">
                        <table className="w-full text-left text-[11px] min-w-[320px]">
                          <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-450">
                            <tr>
                              <th className="p-3 font-bold">{t('admin.tableName')}</th>
                              <th className="p-3 font-bold">{t('admin.tableEmail')}</th>
                              <th className="p-3 font-bold">{t('admin.tableRole')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {excelPreview.map((row, i) => (
                              <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
                                <td className="p-3 font-bold text-slate-700 dark:text-slate-300">{row.name}</td>
                                <td className="p-3 text-slate-500">{row.email}</td>
                                <td className="p-3 font-bold text-sda-blue dark:text-sda-gold">{row.role}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setExcelModalOpen(false);
                      setExcelFile(null);
                      setExcelPreview(null);
                      setExcelErrors(null);
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="button"
                    disabled={!excelPreview || excelPreview.length === 0 || bulkImport.isPending}
                    onClick={handleBulkImportSubmit}
                    className="px-6 py-2 bg-sda-blue text-white font-bold rounded-xl text-xs cursor-pointer disabled:opacity-40 hover:bg-sda-blue-dark flex items-center gap-1.5"
                  >
                    {bulkImport.isPending ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> {t('admin.importRegistering')}
                      </>
                    ) : (
                      t('admin.confirmImport')
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900/30 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-green-700 dark:text-green-400">
                    <CheckCircle size={16} /> {t('admin.bulkSuccess')}
                  </div>
                  <p className="text-[10px] text-green-600 dark:text-green-500 leading-relaxed font-semibold">
                    {t('admin.bulkSuccessDesc', { count: importResultCredentials.length })}
                  </p>
                </div>

                {/* Import Table of credentials */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-450 uppercase">{t('admin.generatedPasswords')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const csvHeader = 'Name,Email,TemporaryPassword\n';
                        const csvRows = importResultCredentials.map(c => `${c.name},${c.email},${c.tempPass}`).join('\n');
                        const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `imported-credentials-${Date.now()}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-[10px] font-bold text-sda-blue dark:text-sda-gold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Download size={12} /> {t('admin.downloadCsv')}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-150 dark:border-slate-800 max-h-[220px]">
                    <table className="w-full text-left text-[11px] min-w-[320px]">
                      <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-450">
                        <tr>
                          <th className="p-3 font-bold">{t('admin.tableUser')}</th>
                          <th className="p-3 font-bold">{t('admin.tableEmail')}</th>
                          <th className="p-3 font-bold">{t('admin.tableTemporaryPassword')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResultCredentials.map((cred, i) => (
                          <tr key={i} className="border-b border-slate-100 dark:border-slate-800 font-medium">
                            <td className="p-3 text-slate-700 dark:text-slate-300">{cred.name}</td>
                            <td className="p-3 text-slate-500">{cred.email}</td>
                            <td className="p-3">
                              <code className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-extrabold select-all text-sda-blue dark:text-sda-gold-light border dark:border-slate-700">
                                {cred.tempPass}
                              </code>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setExcelModalOpen(false);
                      setImportResultCredentials(null);
                    }}
                    className="px-8 py-2.5 bg-sda-blue text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-sda-blue-dark shadow-xs"
                  >
                    {t('admin.finish')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Permissions Dialog */}
      {permUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="perm-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setPermUser(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="perm-dialog-title" className="text-lg font-bold">
              {t('admin.permissions')} — {permUser.name}
            </h3>
            <div className="mt-4 space-y-4">
              {PERMISSION_GROUPS.map((g) => (
                <div key={g.id}>
                  <p className="text-xs font-bold uppercase text-slate-500">{t(g.labelKey as 'admin.permGroupCore')}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {g.permissions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePerm(p)}
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-bold ring-1 transition cursor-pointer',
                          selectedPerms.includes(p) ? 'bg-sda-blue text-white ring-sda-blue' : 'ring-slate-200 text-slate-650 dark:ring-slate-650'
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPermUser(null)} className="rounded-lg border px-4 py-2 text-sm font-bold cursor-pointer">
                {t('common.cancel')}
              </button>
              <button
                type="button"
                disabled={setPerms.isPending}
                onClick={savePerms}
                className="rounded-lg bg-sda-blue px-4 py-2 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Logs & Admin Activity side-by-side */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">Audit Logs</h3>
          {la || !audit ? (
            <LoadingBlock className="mt-4 min-h-[120px]" />
          ) : (
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
              {audit.map((a) => (
                <div key={a.id} className="rounded-xl border border-slate-100 dark:border-slate-800/60 p-3 bg-slate-50/50 dark:bg-slate-800/10 text-xs flex justify-between gap-4 items-start">
                  <div>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase mr-2",
                      a.severity === 'WARN' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450' : 'bg-sda-blue/5 text-sda-blue dark:bg-sda-gold/10 dark:text-sda-gold-light'
                    )}>
                      {a.action}
                    </span>
                    <p className="mt-1.5 font-bold text-slate-850 dark:text-slate-200">Target: {a.target}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Actor: {a.actor}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                    {new Date(a.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-2xs">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white mb-4">Recent Leader Activity</h3>
          {lac || !activity ? (
            <LoadingBlock className="mt-4 min-h-[120px]" />
          ) : (
            <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
              {activity.map((a) => (
                <div key={a.id} className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-800/10 text-xs flex justify-between gap-2 items-center">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{a.user}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{a.description}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold shrink-0">
                    {new Date(a.at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserManagement;
