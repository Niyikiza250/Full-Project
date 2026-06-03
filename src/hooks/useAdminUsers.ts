import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MOCK_MANAGED_USERS, MOCK_AUDIT_LOGS, MOCK_ADMIN_ACTIVITY } from '@/data/enterpriseMocks';
import type { AccountStatus, ManagedUser } from '@/types/admin';
import type { UserRole } from '@/constants/routes';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const keys = {
  users: ['admin', 'users'] as const,
  audit: ['admin', 'audit'] as const,
  activity: ['admin', 'activity'] as const,
};

export function useManagedUsers() {
  return useQuery({
    queryKey: keys.users,
    queryFn: async () => {
      await delay(400);
      return [...MOCK_MANAGED_USERS];
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: keys.audit,
    queryFn: async () => {
      await delay(350);
      return [...MOCK_AUDIT_LOGS].sort((a, b) => b.at.localeCompare(a.at));
    },
  });
}

export function useAdminActivity() {
  return useQuery({
    queryKey: keys.activity,
    queryFn: async () => {
      await delay(300);
      return [...MOCK_ADMIN_ACTIVITY].sort((a, b) => b.at.localeCompare(a.at));
    },
  });
}

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: UserRole }) => {
      await delay(400);
      const u = MOCK_MANAGED_USERS.find((x) => x.id === id);
      if (!u) throw new Error('User not found');
      u.role = role;
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'ROLE_CHANGED',
        target: u.email,
        at: new Date().toISOString(),
        severity: 'INFO',
      });
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
      await delay(350);
      const u = MOCK_MANAGED_USERS.find((x) => x.id === id);
      if (!u) throw new Error('User not found');
      u.status = status;
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'ACCOUNT_STATUS',
        target: `${u.email} → ${status}`,
        at: new Date().toISOString(),
        severity: status === 'SUSPENDED' || status === 'LOCKED' ? 'WARN' : 'INFO',
      });
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
      await delay(500);
      MOCK_MANAGED_USERS.push({
        id: `u-${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        status: 'INVITED',
        mfaEnabled: false,
        permissions: [],
      });
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'USER_INVITED',
        target: payload.email,
        at: new Date().toISOString(),
        severity: 'INFO',
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
      await delay(400);
      const u = MOCK_MANAGED_USERS.find((x) => x.id === id);
      if (!u) throw new Error('User not found');
      u.permissions = [...permissions];
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'PERMISSIONS_UPDATED',
        target: u.email,
        at: new Date().toISOString(),
        severity: 'INFO',
      });
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
      await delay(400);
      const u = MOCK_MANAGED_USERS.find((x) => x.id === id);
      if (!u) throw new Error('User not found');
      u.name = name;
      u.email = email;
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'USER_UPDATED',
        target: email,
        at: new Date().toISOString(),
        severity: 'INFO',
      });
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
      await delay(400);
      const index = MOCK_MANAGED_USERS.findIndex((x) => x.id === id);
      if (index === -1) throw new Error('User not found');
      const email = MOCK_MANAGED_USERS[index].email;
      MOCK_MANAGED_USERS.splice(index, 1);
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'USER_DELETED',
        target: email,
        at: new Date().toISOString(),
        severity: 'WARN',
      });
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
      await delay(400);
      const u = MOCK_MANAGED_USERS.find((x) => x.id === id);
      if (!u) throw new Error('User not found');
      
      const tempPass = 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      
      // Save password and status in simulated state
      u.temporaryPasswordStatus = true;
      
      MOCK_AUDIT_LOGS.unshift({
        id: `a-${Date.now()}`,
        actor: 'current@session',
        action: 'PASSWORD_RESET',
        target: u.email,
        at: new Date().toISOString(),
        severity: 'INFO',
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
      await delay(800);
      const credentials: Array<{ name: string; email: string; tempPass: string }> = [];
      
      for (const row of rows) {
        const tempPass = 'TEMP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
        
        MOCK_MANAGED_USERS.push({
          id: `u-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: row.name,
          email: row.email,
          role: row.role,
          status: 'ACTIVE',
          temporaryPasswordStatus: true,
          mfaEnabled: false,
          permissions: [],
        });

        credentials.push({
          name: row.name,
          email: row.email,
          tempPass,
        });

        MOCK_AUDIT_LOGS.unshift({
          id: `a-${Date.now()}`,
          actor: 'current@session',
          action: 'BULK_IMPORT_USER',
          target: row.email,
          at: new Date().toISOString(),
          severity: 'INFO',
        });
      }

      return credentials;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.users });
      qc.invalidateQueries({ queryKey: keys.audit });
    },
  });
}
