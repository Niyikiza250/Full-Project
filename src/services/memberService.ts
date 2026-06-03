import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MOCK_MEMBERS, MOCK_CHANGE_REQUESTS } from '@/utils/mockData';
import { Member, MemberChangeRequest, MemberFilters, MemberStatus } from '@/types/member';
import { UserRole } from '@/constants/routes';

// --- existing: Member CRUD ---

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

const fetchMembers = async (filters?: AdvancedMemberFilters): Promise<PaginatedResponse<Member>> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  let filtered = [...MOCK_MEMBERS];
  const page = filters?.page || 1;
  const limit = filters?.limit || 10;
  
  if (filters?.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(m => 
      m.firstName.toLowerCase().includes(search) || 
      m.lastName.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search)
    );
  }
  
  if (filters?.role) filtered = filtered.filter(m => m.role === filters.role);
  if (filters?.status) filtered = filtered.filter(m => m.status === filters.status);
  if (filters?.field) filtered = filtered.filter(m => m.fieldName === filters.field);
  if (filters?.church) filtered = filtered.filter(m => m.churchName === filters.church);
  if (filters?.zone) filtered = filtered.filter(m => m.zoneName === filters.zone);
  if (filters?.sabbathClass) filtered = filtered.filter(m => m.sabbathClass === filters.sabbathClass);

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paginatedData = filtered.slice(start, start + limit);
  
  return {
    data: paginatedData,
    total,
    page,
    limit
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_MEMBERS.find(m => m.id === id);
    },
    enabled: !!id,
  });
};

// --- Change Request hooks ---

export const useMemberChangeRequests = () => {
  return useQuery({
    queryKey: ['memberChangeRequests'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return [...MOCK_CHANGE_REQUESTS];
    },
  });
};

export const useApproveChangeRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewedBy }: { id: string; reviewedBy: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const idx = MOCK_CHANGE_REQUESTS.findIndex(cr => cr.id === id);
      if (idx === -1) throw new Error('Change request not found');
      MOCK_CHANGE_REQUESTS[idx] = {
        ...MOCK_CHANGE_REQUESTS[idx],
        status: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date().toISOString(),
      };
      return MOCK_CHANGE_REQUESTS[idx];
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
      await new Promise((resolve) => setTimeout(resolve, 500));
      const idx = MOCK_CHANGE_REQUESTS.findIndex(cr => cr.id === id);
      if (idx === -1) throw new Error('Change request not found');
      MOCK_CHANGE_REQUESTS[idx] = {
        ...MOCK_CHANGE_REQUESTS[idx],
        status: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date().toISOString(),
        rejectionReason: reason,
      };
      return MOCK_CHANGE_REQUESTS[idx];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memberChangeRequests'] });
    },
  });
};
