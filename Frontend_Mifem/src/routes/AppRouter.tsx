import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ROUTES, UserRole } from '@/constants/routes';
import { ProtectedRoute, PublicRoute, AdminRoute, RoleBasedRoute } from './RouteGuards';
import { Loader2 } from 'lucide-react';

// Layouts (loaded eagerly â€” small, needed immediately)
import MainLayout from '@/layouts/MainLayout';
import AuthLayout from '@/layouts/AuthLayout';

// â”€â”€â”€ Lazy-loaded page modules (code-split per route) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const MemberDirectory = lazy(() => import('@/pages/MemberDirectory'));
const MemberDetails = lazy(() => import('@/pages/MemberDetails'));
const MemberForm = lazy(() => import('@/pages/MemberForm'));
const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));
const ForgotPassword = lazy(() => import('@/pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/auth/ResetPassword'));
const OTPVerification = lazy(() => import('@/pages/auth/OTPVerification'));
const Unauthorized = lazy(() => import('@/pages/auth/Unauthorized'));
const SessionExpired = lazy(() => import('@/pages/auth/SessionExpired'));
const EventDashboard = lazy(() => import('@/pages/events/EventDashboard'));
const EventForm = lazy(() => import('@/pages/events/EventForm'));
const EventDetails = lazy(() => import('@/pages/events/EventDetails'));
const AttendanceTracking = lazy(() => import('@/pages/attendance/AttendanceTracking'));
const CommunicationHub = lazy(() => import('@/pages/communication/CommunicationHub'));
const ReportsAnalytics = lazy(() => import('@/pages/reports/ReportsAnalytics'));
const AchievementsModule = lazy(() => import('@/pages/achievements/AchievementsModule'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const UserScopeSelect = lazy(() => import('@/pages/admin/UserScopeSelect'));
const FieldsPage = lazy(() => import('@/pages/admin/FieldsPage'));
const DistrictsPage = lazy(() => import('@/pages/admin/DistrictsPage'));
const ChurchesPage = lazy(() => import('@/pages/admin/ChurchesPage'));
const Profile = lazy(() => import('@/pages/Profile'));
const Settings = lazy(() => import('@/pages/Settings'));
const ForcePasswordChange = lazy(() => import('@/pages/auth/ForcePasswordChange'));
const Home = lazy(() => import('@/pages/Home'));
const AnnouncementsPage = lazy(() => import('@/pages/announcements/AnnouncementsPage'));
const PrayerCounselingPage = lazy(() => import('@/pages/prayer/PrayerCounselingPage'));
const TrainingPage = lazy(() => import('@/pages/training/TrainingPage'));
const DocumentsPage = lazy(() => import('@/pages/documents/DocumentsPage'));
const ForumsPage = lazy(() => import('@/pages/forums/ForumsPage'));
const ServiceHoursPage = lazy(() => import('@/pages/volunteers/ServiceHoursPage'));
const RecognitionPage = lazy(() => import('@/pages/volunteers/RecognitionPage'));
const LandingPageSettings = lazy(() => import('@/pages/admin/LandingPageSettings'));
const HomeContent = lazy(() => import('@/pages/HomeContent'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="animate-spin text-sda-blue" size={40} />
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
    </div>
  </div>
);

// Single source of truth for "/" â€” both guests and authenticated users can view the Home page
const HomeRoute: React.FC = () => {
  return <Home />;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Public Home Page â€” no auth required, no layout wrapper */}
          <Route path={ROUTES.HOME} element={<HomeRoute />} />

          {/* Public/Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route element={<AuthLayout />}>
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
              <Route path={ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
              <Route path={ROUTES.VERIFY_OTP} element={<OTPVerification />} />
              <Route path={ROUTES.SESSION_EXPIRED} element={<SessionExpired />} />
            </Route>
          </Route>

          {/* Special Auth Routes (Always accessible or layout-less) */}
          <Route element={<AuthLayout />}>
            <Route path={ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.FORCE_PASSWORD_CHANGE} element={<ForcePasswordChange />} />
            <Route element={<MainLayout />}>
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.HOME_CONTENT} element={<HomeContent />} />
              <Route path={ROUTES.MEMBERS} element={<MemberDirectory />} />
              <Route path={ROUTES.MEMBER_DETAILS} element={<MemberDetails />} />
              <Route path={ROUTES.EVENTS} element={<EventDashboard />} />
              <Route path={ROUTES.EVENT_DETAILS} element={<EventDetails />} />
              <Route path={ROUTES.ATTENDANCE} element={<AttendanceTracking />} />
              <Route path={ROUTES.COMMUNICATION} element={<CommunicationHub />} />
              <Route path={ROUTES.REPORTS} element={<ReportsAnalytics />} />
              <Route path={ROUTES.ACHIEVEMENTS} element={<AchievementsModule />} />
              <Route path={ROUTES.PROFILE} element={<Profile />} />

              {/* SUPER_ADMIN only routes */}
              <Route element={<AdminRoute />}>
                <Route path={ROUTES.SETTINGS} element={<Settings />} />
                <Route path={ROUTES.EVENT_ADD} element={<EventForm />} />
                <Route path={ROUTES.EVENT_EDIT} element={<EventForm />} />
                <Route path={ROUTES.ADMIN_USERS} element={<UserManagement />} />
                <Route path={ROUTES.ADMIN_USERS_SELECT} element={<UserScopeSelect />} />
                <Route path={ROUTES.ADMIN_FIELDS} element={<FieldsPage />} />
                <Route path={ROUTES.ADMIN_DISTRICTS} element={<DistrictsPage />} />
                <Route path={ROUTES.ADMIN_CHURCHES} element={<ChurchesPage />} />
                <Route path={ROUTES.SYSTEM_SETTINGS} element={<Settings />} />
                <Route path={ROUTES.LANDING_PAGE} element={<LandingPageSettings />} />
              </Route>

              {/* Member create/edit â€” accessible by authorized roles */}
              <Route element={<RoleBasedRoute allowedRoles={['SUPER_ADMIN', 'FIELD_ADMINISTRATOR', 'CHURCH_LEADER', 'MINISTRY_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.MEMBER_ADD} element={<MemberForm />} />
                <Route path={ROUTES.MEMBER_EDIT} element={<MemberForm />} />
              </Route>

              {/* Role-specific routes (placeholder pages - render dashboard until dedicated pages are built) */}
              <Route element={<RoleBasedRoute allowedRoles={['UNION_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.FIELDS} element={<Dashboard />} />
                <Route path={ROUTES.MINISTRY_ACTIVITIES} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FIELD_ADMINISTRATOR', 'FIELD_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.DISTRICTS} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FIELD_ADMINISTRATOR', 'DISTRICT_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.CHURCHES} element={<Dashboard />} />
                <Route path={ROUTES.CHURCH_LEADERS} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['FIELD_ADMINISTRATOR'] as UserRole[]} />}>
                <Route path={ROUTES.TASKS} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['CHURCH_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.ACTIVITIES} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['MINISTRY_LEADER'] as UserRole[]} />}>
                <Route path={ROUTES.VOLUNTEERS} element={<Dashboard />} />
                <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
                <Route path={ROUTES.PROGRAMS} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['MEMBER'] as UserRole[]} />}>
                <Route path={ROUTES.CALENDAR} element={<Dashboard />} />
              </Route>

              <Route element={<RoleBasedRoute allowedRoles={['VOLUNTEER'] as UserRole[]} />}>
                <Route path={ROUTES.TASKS} element={<Dashboard />} />
                <Route path={ROUTES.PARTICIPATION_HISTORY} element={<Dashboard />} />
              </Route>

              {/* Routes accessible by SUPER_ADMIN only via role check */}
              <Route element={<RoleBasedRoute allowedRoles={['SUPER_ADMIN'] as UserRole[]} />}>
                <Route path={ROUTES.ROLES_PERMISSIONS} element={<UserManagement />} />
                <Route path={ROUTES.ANALYTICS} element={<ReportsAnalytics />} />
                <Route path={ROUTES.NOTIFICATIONS} element={<CommunicationHub />} />
                <Route path={ROUTES.AUDIT_LOGS} element={<UserManagement />} />
              </Route>

              {/* Announcements â€” accessible by all roles that can send or read */}
              <Route
                path={ROUTES.ANNOUNCEMENTS}
                element={<RoleBasedRoute allowedRoles={['SUPER_ADMIN', 'UNION_LEADER', 'FIELD_ADMINISTRATOR', 'FIELD_LEADER', 'DISTRICT_LEADER', 'CHURCH_LEADER', 'MINISTRY_LEADER', 'MEMBER', 'VOLUNTEER'] as UserRole[]} />}
              >
                <Route index element={<AnnouncementsPage />} />
              </Route>

              {/* New Module Routes */}
              <Route path={ROUTES.PRAYER_COUNSELING} element={<PrayerCounselingPage />} />
              <Route path={ROUTES.TRAINING} element={<TrainingPage />} />
              <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
              <Route path={ROUTES.FORUMS} element={<ForumsPage />} />
              <Route path={ROUTES.VOLUNTEER_HOURS} element={<ServiceHoursPage />} />
              <Route path={ROUTES.VOLUNTEER_RECOGNITION} element={<RecognitionPage />} />

              <Route path="/home" element={<Navigate to={ROUTES.HOME} replace />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRouter;
