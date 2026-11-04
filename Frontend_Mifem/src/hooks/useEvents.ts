import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '@/services/eventService';
import { Event, EventFilters } from '@/types/event';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: EventFilters) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

export function useEvents(filters?: EventFilters) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventService.getEvents(filters),
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventService.getEventById(id),
    enabled: !!id,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: Omit<Event, 'id' | 'currentAttendees' | 'attendance'>) =>
      eventService.createEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Event> }) =>
      eventService.updateEvent(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
    },
  });
}

export function useRegisterAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      eventId,
      memberId,
      memberName,
    }: {
      eventId: string;
      memberId: string;
      memberName: string;
    }) => eventService.registerAttendance(eventId, memberId, memberName),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}
