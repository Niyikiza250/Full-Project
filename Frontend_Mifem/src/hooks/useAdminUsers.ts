import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { AccountStatus, ManagedUser } from '@/types/admin';
import type { UserRole } from '@/constants/routes';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  accountStatus: string;
  role: { id: string; name: string; hierarchy: number } | null;
  rolePermissions: string[];
  fieldId: string | null;
  unionId: string | null;
  districtId: string | null;
  churchId: string | null;
  ministryId: string | null;
  mfaEnabled: boolean;
  temporaryPasswordStatus: boolean;
  lastLogin: string | null;
  phone?: string;
  location?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

function mapBackendUser(u: BackendUser): ManagedUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: (u.role?.name as UserRole) || 'MEMBER',
    status: u.accountStatus as AccountStatus,
    mfaEnabled: u.mfaEnabled,
    permissions: u.rolePermissions || [],
    fieldId: u.fieldId || undefined,
    unionId: u.unionId || undefined,
    districtId: u.districtId || undefined,
    churchId: u.churchId || undefined,
    ministryId: u.ministryId || undefined,
    temporaryPasswordStatus: u.temporaryPasswordStatus,
    lastLogin: u.lastLogin || undefined,
  };
}

const keys = {
  users: ['admin', 'users'] as const,
  audit: ['admin', 'audit'] as const,
  activity: ['admin', 'activity'] as const,
};

export function useManagedUsers() {
  return useQuery({
    queryKey: keys.users,
    queryFn: async () => {
      const res = await apiClient.get('/users');
      const body = res.data;
      const raw: BackendUser[] = body.data ?? body ?? [];
      return raw.map(mapBackendUser);
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: keys.audit,
    queryFn: async () => {
      const res = await apiClient.get('/admin/audit-logs');
      return res.data.data ?? res.data ?? [];
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: keys.activity,
    queryFn: async () => {
      const res = await apiClient.get('/admin/activity');
      return res.data.data ?? res.data ?? [];
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      await apiClient.put(`/users/${id}`, { roleId: role });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AccountStatus }) => {
      await apiClient.put(`/users/${id}`, { accountStatus: status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; email: string; role: UserRole }) => {
      await apiClient.post('/users', {
        name: payload.name,
        email: payload.email,
        password: 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        roleId: payload.role,
        accountStatus: 'INVITED',
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useSetUserPermissions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      await apiClient.put(`/users/${id}`, { rolePermissions: permissions });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useUpdateUserDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, name, email }: { id: string; name: string; email: string }) => {
      await apiClient.put(`/users/${id}`, { name, email });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/users/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const tempPass = 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      await apiClient.put(`/users/${id}`, {
        password: tempPass,
        temporaryPasswordStatus: true,
      });
      return tempPass;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}

export function useBulkImportUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (rows: Array<{ name: string; email: string; role: UserRole }>) => {
      const users = rows.map((r) => ({
        name: r.name,
        email: r.email,
        password: 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        roleId: r.role,
        accountStatus: 'ACTIVE',
      }));
      await apiClient.post('/users/bulk-import', { users });

      const credentials = rows.map((r) => ({
        name: r.name,
        email: r.email,
        tempPass: 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      }));

      return credentials;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}
