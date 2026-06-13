import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/api/client';

export interface Union {
  id: string;
  name: string;
  code?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Field {
  id: string;
  name: string;
  code?: string;
  unionId: string;
  status?: 'ACTIVE' | 'INACTIVE';
  union?: Union;
  districts?: District[];
}

export interface District {
  id: string;
  name: string;
  code?: string;
  fieldId: string;
  status?: 'ACTIVE' | 'INACTIVE';
  field?: Field;
  churches?: Church[];
}

export interface Church {
  id: string;
  name: string;
  code?: string;
  districtId: string;
  fieldId?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  district?: District;
  field?: Field;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface QueryParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

const buildParams = (params?: QueryParams) => {
  const clean: Record<string, string> = {};
  if (!params) return clean;
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') clean[k] = String(v);
  }
  return clean;
};

const keys = {
  unions: ['locations', 'unions'] as const,
  fields: (p?: QueryParams) => ['locations', 'fields', p] as const,
  field: (id: string) => ['locations', 'fields', id] as const,
  districts: (p?: QueryParams) => ['locations', 'districts', p] as const,
  district: (id: string) => ['locations', 'districts', id] as const,
  churches: (p?: QueryParams) => ['locations', 'churches', p] as const,
  church: (id: string) => ['locations', 'churches', id] as const,
  nearbyChurches: (lat: number, lng: number, radius?: number) =>
    ['locations', 'churches', 'nearby', lat, lng, radius] as const,
};

// === UNIONS ===
export function useUnions() {
  return useQuery({
    queryKey: keys.unions,
    queryFn: async () => {
      const { data } = await apiClient.get<Union[]>('/churches/unions');
      return data;
    },
  });
}

// === FIELDS ===
export function useFields(params?: QueryParams) {
  return useQuery({
    queryKey: keys.fields(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Field>>('/churches/fields', {
        params: buildParams(params),
      });
      return data;
    },
  });
}

export function useField(id: string) {
  return useQuery({
    queryKey: keys.field(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Field>(`/api/churches/fields/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Field>) => {
      const { data } = await apiClient.post<Field>('/churches/fields', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'fields'] });
    },
  });
}

export function useUpdateField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Field> & { id: string }) => {
      const { data } = await apiClient.put<Field>(`/api/churches/fields/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'fields'] });
    },
  });
}

export function useDeleteField() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/churches/fields/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'fields'] });
    },
  });
}

// === DISTRICTS ===
export function useDistricts(params?: QueryParams) {
  return useQuery({
    queryKey: keys.districts(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<District>>('/churches/districts', {
        params: buildParams(params),
      });
      return data;
    },
  });
}

export function useDistrict(id: string) {
  return useQuery({
    queryKey: keys.district(id),
    queryFn: async () => {
      const { data } = await apiClient.get<District>(`/api/churches/districts/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<District>) => {
      const { data } = await apiClient.post<District>('/churches/districts', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'districts'] });
    },
  });
}

export function useUpdateDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<District> & { id: string }) => {
      const { data } = await apiClient.put<District>(`/api/churches/districts/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'districts'] });
    },
  });
}

export function useDeleteDistrict() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/churches/districts/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'districts'] });
    },
  });
}

// === CHURCHES ===
export function useChurches(params?: QueryParams) {
  return useQuery({
    queryKey: keys.churches(params),
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Church>>('/churches', {
        params: buildParams(params),
      });
      return data;
    },
  });
}

export function useChurch(id: string) {
  return useQuery({
    queryKey: keys.church(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Church>(`/api/churches/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateChurch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Church>) => {
      const { data } = await apiClient.post<Church>('/churches', payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'churches'] });
    },
  });
}

export function useUpdateChurch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Church> & { id: string }) => {
      const { data } = await apiClient.put<Church>(`/api/churches/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'churches'] });
    },
  });
}

export function useDeleteChurch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/churches/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['locations', 'churches'] });
    },
  });
}

export function useNearbyChurches(lat: number, lng: number, radius?: number) {
  return useQuery({
    queryKey: keys.nearbyChurches(lat, lng, radius),
    queryFn: async () => {
      const params: Record<string, string> = { lat: String(lat), lng: String(lng) };
      if (radius) params.radius = String(radius);
      const { data } = await apiClient.get<Church[]>('/churches/nearby', { params });
      return data;
    },
    enabled: lat !== 0 && lng !== 0,
  });
}
