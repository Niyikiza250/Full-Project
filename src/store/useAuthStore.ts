import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/constants/routes';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  temporaryPasswordStatus?: boolean;
  rolePermissions?: string[];
  accountStatus?: 'ACTIVE' | 'SUSPENDED' | 'LOCKED' | 'INVITED';
  createdBy?: string;
  lastLogin?: string;
  unionId?: string;
  fieldId?: string;
  districtId?: string;
  churchId?: string;
  ministryId?: string;
  volunteerId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  excelImportAllowedRoles: UserRole[];
  login: (user: User, token: string) => void;
  logout: () => void;
  updateProfilePicture: (base64: string | undefined) => void;
  updateUserFields: (fields: Partial<User>) => void;
  completePasswordChange: () => void;
  toggleExcelImportPermission: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      excelImportAllowedRoles: ['SUPER_ADMIN'],
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateProfilePicture: (base64) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, profilePicture: base64 },
          };
        });
      },
      updateUserFields: (fields) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, ...fields },
          };
        });
      },
      completePasswordChange: () => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: { ...state.user, temporaryPasswordStatus: false },
          };
        });
      },
      toggleExcelImportPermission: (role) => {
        set((state) => {
          const current = state.excelImportAllowedRoles || ['SUPER_ADMIN'];
          const updated = current.includes(role)
            ? current.filter((r) => r !== role)
            : [...current, role];
          return { excelImportAllowedRoles: updated };
        });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
