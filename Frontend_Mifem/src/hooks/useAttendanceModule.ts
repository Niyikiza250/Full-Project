import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MOCK_ATTENDANCE_SESSIONS,
  MOCK_ATTENDANCE_CHECKINS,
  MOCK_ATTENDANCE_TRENDS,
} from '@/data/enterpriseMocks';
import type { AttendanceCheckIn, AttendanceSession } from '@/types/attendance';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const keys = {
  sessions: ['attendance', 'sessions'] as const,
  checkins: (sessionId?: string) => ['attendance', 'checkins', sessionId] as const,
  trends: ['attendance', 'trends'] as const,
};

export function useAttendanceSessions() {
  return useQuery({
    queryKey: keys.sessions,
    queryFn: async () => {
      await delay(400);
      return [...MOCK_ATTENDANCE_SESSIONS];
    },
  });
}

export function useAttendanceCheckins(sessionId?: string) {
  return useQuery({
    queryKey: keys.checkins(sessionId),
    queryFn: async () => {
      await delay(350);
      let rows = [...MOCK_ATTENDANCE_CHECKINS];
      if (sessionId) rows = rows.filter((c) => c.sessionId === sessionId);
      return rows.sort((a, b) => b.checkedInAt.localeCompare(a.checkedInAt));
    },
  });
}

export function useAttendanceTrends() {
  return useQuery({
    queryKey: keys.trends,
    queryFn: async () => {
      await delay(300);
      return [...MOCK_ATTENDANCE_TRENDS];
    },
  });
}

export function useDigitalCheckIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sessionId,
      memberId,
      memberName,
      method,
    }: {
      sessionId: string;
      memberId: string;
      memberName: string;
      method: AttendanceCheckIn['method'];
    }) => {
      await delay(500);
      const session = MOCK_ATTENDANCE_SESSIONS.find((s) => s.id === sessionId);
      if (!session) throw new Error('Session not found');
      const row: AttendanceCheckIn = {
        id: `c-${Date.now()}`,
        sessionId,
        memberId,
        memberName,
        method,
        checkedInAt: new Date().toISOString(),
      };
      MOCK_ATTENDANCE_CHECKINS.unshift(row);
      session.present = Math.min(session.expected, session.present + 1);
      return row;
    },
    onSuccess: (_, v) => {
      queryClient.invalidateQueries({ queryKey: keys.sessions });
      queryClient.invalidateQueries({ queryKey: keys.checkins(v.sessionId) });
      queryClient.invalidateQueries({ queryKey: keys.checkins(undefined) });
    },
  });
}

export function exportAttendanceCsv(rows: AttendanceCheckIn[], sessions: AttendanceSession[]) {
  const map = new Map(sessions.map((s) => [s.id, s.name]));
  const header = 'session,memberId,memberName,method,checkedInAt';
  const body = rows
    .map(
      (r) =>
        `"${map.get(r.sessionId) ?? r.sessionId}","${r.memberId}","${r.memberName.replace(/"/g, '""')}","${r.method}","${r.checkedInAt}"`
    )
    .join('\n');
  return `${header}\n${body}`;
}
