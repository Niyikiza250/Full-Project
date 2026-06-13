export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_OTP: '/verify-otp',
  UNAUTHORIZED: '/unauthorized',
  SESSION_EXPIRED: '/session-expired',
  DASHBOARD: '/dashboard',
  MEMBERS: '/members',
  MEMBER_ADD: '/members/add',
  MEMBER_EDIT: '/members/edit/:id',
  MEMBER_DETAILS: '/members/:id',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  EVENTS: '/events',
  EVENT_ADD: '/events/add',
  EVENT_EDIT: '/events/edit/:id',
  EVENT_DETAILS: '/events/:id',
  ATTENDANCE: '/attendance',
  COMMUNICATION: '/communication',
  REPORTS: '/reports',
  ACHIEVEMENTS: '/achievements',
  ADMIN_USERS: '/admin/users',
  ADMIN_FIELDS: '/admin/fields',
  ADMIN_DISTRICTS: '/admin/districts',
  ADMIN_CHURCHES: '/admin/churches',
  FORCE_PASSWORD_CHANGE: '/change-password-force',
  // New role-specific routes
  FIELDS: '/fields',
  DISTRICTS: '/districts',
  CHURCHES: '/churches',
  MINISTRY_ACTIVITIES: '/ministry-activities',
  VOLUNTEERS: '/volunteers',
  TASKS: '/tasks',
  CALENDAR: '/calendar',
  DOCUMENTS: '/documents',
  PROGRAMS: '/programs',
  PARTICIPATION_HISTORY: '/participation-history',
  AUDIT_LOGS: '/audit-logs',
  LOGIN_HISTORY: '/login-history',
  ANNOUNCEMENTS: '/announcements',
  NOTIFICATIONS: '/notifications',
  SYSTEM_SETTINGS: '/system-settings',
  MODULES: '/modules',
  ANALYTICS: '/analytics',
  ROLES_PERMISSIONS: '/roles-permissions',
  UPLOADED_FILES: '/uploaded-files',
  LANGUAGE_SETTINGS: '/language-settings',
  CHURCH_LEADERS: '/church-leaders',
  ACTIVITIES: '/activities',
  // New module routes
  PRAYER_COUNSELING: '/prayer-counseling',
  TRAINING: '/training',
  TRAINING_COURSE: '/training/courses/:id',
  TRAINING_LESSON: '/training/lessons/:id',
  TRAINING_QUIZ: '/training/quizzes/:id',
  CERTIFICATES: '/training/certificates',
  DOCUMENTS: '/documents',
  NOTIFICATIONS_LIST: '/notifications',
  GROUP_MESSAGES: '/communication/groups',
  FORUMS: '/communication/forums',
  FORUM: '/communication/forums/:id',
  VOLUNTEER_HOURS: '/volunteers/hours',
  VOLUNTEER_RECOGNITION: '/volunteers/recognition',
  VOLUNTEER_AVAILABILITY: '/volunteers/availability',
};

export type UserRole =
  | 'SUPER_ADMIN'
  | 'UNION_LEADER'
  | 'FIELD_ADMINISTRATOR'
  | 'FIELD_LEADER'
  | 'DISTRICT_LEADER'
  | 'CHURCH_LEADER'
  | 'MINISTRY_LEADER'
  | 'MEMBER'
  | 'VOLUNTEER';

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  SUPER_ADMIN: 0,
  UNION_LEADER: 1,
  FIELD_ADMINISTRATOR: 2,
  FIELD_LEADER: 3,
  DISTRICT_LEADER: 4,
  CHURCH_LEADER: 5,
  MINISTRY_LEADER: 6,
  MEMBER: 7,
  VOLUNTEER: 8,
};

export function canAccess(requesterRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[requesterRole] <= ROLE_HIERARCHY[targetRole];
}
