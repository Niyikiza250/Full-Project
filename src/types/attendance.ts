export type AttendanceSessionStatus = 'OPEN' | 'CLOSED';

export interface AttendanceSession {
  id: string;
  name: string;
  date: string;
  venue: string;
  present: number;
  expected: number;
  /** Payload encoded in QR for demo check-in */
  qrToken: string;
  status: AttendanceSessionStatus;
  fieldName: string;
}

export interface AttendanceCheckIn {
  id: string;
  sessionId: string;
  memberName: string;
  memberId: string;
  method: 'QR' | 'MANUAL' | 'KIOSK';
  checkedInAt: string;
}

export interface AttendanceTrendPoint {
  period: string;
  rate: number;
  participants: number;
}
