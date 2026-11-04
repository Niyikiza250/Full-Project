import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';
import { Member, MemberFilters, MemberChangeRequest, MemberActivity, MinistryRole } from '@/types/member';
import { UserRole } from '@/constants/routes';
import type { MemberStatus } from '@/types/member';

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdvancedMemberFilters extends MemberFilters {
  page?: number;
  limit?: number;
  zone?: string;
}

interface BackendMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  role?: UserRole;
  status?: MemberStatus;
  gender?: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  ageGroup?: string;
  baptismDate?: string;
  createdAt?: string;
  address?: string;
  village?: string;
  sector?: string;
  district?: string;
  sabbathClass?: string;
  imageUrl?: string;
  emergencyName?: string;
  emergencyPhone?: string;
  registrationType?: string;
  activities?: MemberActivity[];
  ministryRoles?: Array<{ role: string; assignedAt?: string }>;
  church?: { name?: string; zoneName?: string; field?: { name?: string; union?: { name?: string } } };
}

interface BackendChangeRequest {
  id: string;
  memberId?: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  changes: Partial<Member>;
  submittedBy: string;
  submittedByRole: UserRole;
  submittedByUser?: { email?: string };
  createdAt?: string;
  submittedAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const mapBackendMember = (raw: BackendMember): Member => {
  const church = raw.church || {};
  const field = church.field || {};
  const union = field.union || {};
  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email || '',
    phone: raw.phone || '',
    whatsapp: raw.whatsapp || '',
    role: raw.role || 'MEMBER',
    status: raw.status || 'ACTIVE',
    churchName: church.name || '',
    zoneName: church.zoneName || '',
    fieldName: field.name || '',
    unionName: union.name || '',
    sabbathClass: raw.sabbathClass || '',
    baptismDate: raw.baptismDate || '',
    joinDate: raw.createdAt || '',
    address: raw.address || '',
    village: raw.village || '',
    sector: raw.sector || '',
    district: raw.district || '',
    gender: raw.gender || 'MALE',
    dateOfBirth: raw.dateOfBirth || '',
    ageGroup: raw.ageGroup as Member['ageGroup'],
    ministryRoles: raw.ministryRoles?.map((mr) => mr.role as MinistryRole) || [],
    emergencyContact: raw.emergencyName ? { name: raw.emergencyName, phone: raw.emergencyPhone || '' } : undefined,
    imageUrl: raw.imageUrl || '',
    activities: raw.activities || [],
  };
};

export interface CreateMemberPayload {
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  whatsapp?: string;
  gender: 'MALE' | 'FEMALE';
  dateOfBirth?: string;
  ageGroup?: string;
  churchId: string;
  sabbathClass?: string;
  role?: string;
  status?: string;
  registrationType?: string;
  address?: string;
  village?: string;
  sector?: string;
  district?: string;
  emergencyName: string;
  emergencyPhone: string;
  baptismDate?: string;
  ministryRoles?: string[];
  provinceCode?: number;
  provinceName?: string;
  districtCode?: number;
  districtName?: string;
  sectorCode?: string;
  sectorName?: string;
  cellCode?: number;
  cellName?: string;
  villageCode?: number;
  villageName?: string;
}

const fetchMembers = async (filters?: AdvancedMemberFilters): Promise<PaginatedResponse<Member>> => {
  const params: Record<string, string> = {};
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  params.page = String(page);
  params.limit = String(limit);
  if (filters?.search) params.search = filters.search;
  if (filters?.role) params.role = filters.role;
  if (filters?.status) params.status = filters.status;
  if (filters?.field) params.field = filters.field;
  if (filters?.church) params.church = filters.church;
  if (filters?.zone) params.zone = filters.zone;
  if (filters?.sabbathClass) params.sabbathClass = filters.sabbathClass;

  const { data: res } = await apiClient.get('/members', { params });
  const rows = res.data || [];
  return {
    data: rows.map(mapBackendMember),
    total: res.pagination?.total || rows.length,
    page: res.pagination?.page || page,
    limit: res.pagination?.limit || limit,
  };
};

export const useMembers = (filters?: AdvancedMemberFilters) => {
  return useQuery({
    queryKey: ['members', filters],
    queryFn: () => fetchMembers(filters),
  });
};

export const useMember = (id: string) => {
  return useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data: res } = await apiClient.get(`/members/${id}`);
      return mapBackendMember(res.data || res);
    },
    enabled: !!id,
  });
};

export const useCreateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMemberPayload) => {
      const { data: res } = await apiClient.post('/members', payload);
      return mapBackendMember(res.data || res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: CreateMemberPayload & { id: string }) => {
      const { data: res } = await apiClient.put(`/members/${id}`, payload);
      return mapBackendMember(res.data || res);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', variables.id] });
    },
  });
};

// --- Change Request hooks ---

const mapChangeRequest = (raw: BackendChangeRequest): MemberChangeRequest => ({
  id: raw.id,
  memberId: raw.memberId,
  type: raw.type,
  changes: raw.changes,
  submittedBy: raw.submittedBy,
  submittedByRole: raw.submittedByRole,
  submittedByEmail: raw.submittedByUser?.email || '',
  submittedAt: raw.createdAt || raw.submittedAt || '',
  status: raw.status,
  reviewedBy: raw.reviewedBy,
  reviewedAt: raw.reviewedAt,
  rejectionReason: raw.rejectionReason,
});

export const useMemberChangeRequests = () => {
  return useQuery({
    queryKey: ['memberChangeRequests'],
    queryFn: async () => {
      const { data: res } = await apiClient.get('/members/change-requests/all');
      return (res.data || []).map(mapChangeRequest);
    },
  });
};

export const useApproveChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewedBy }: { id: string; reviewedBy: string }) => {
      const { data: res } = await apiClient.put(`/members/change-requests/${id}/approve`, { reviewedBy });
      return mapChangeRequest(res.data || res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberChangeRequests'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
};

export const useRejectChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewedBy, reason }: { id: string; reviewedBy: string; reason: string }) => {
      const { data: res } = await apiClient.put(`/members/change-requests/${id}/reject`, { reviewedBy, reason });
      return mapChangeRequest(res.data || res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberChangeRequests'] });
    },
  });
};
