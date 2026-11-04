const { sequelize } = require('../config/db');
const logger = require('../utils/logger');

// Auth
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserPermission = require('./UserPermission');
const PasswordReset = require('./PasswordReset');
const OTPVerification = require('./OTPVerification');
const LoginSession = require('./LoginSession');

// Church Structure
const Union = require('./Union');
const Field = require('./Field');
const District = require('./District');
const Church = require('./Church');
const Ministry = require('./Ministry');

// Members
const Member = require('./Member');
const MemberProfile = require('./MemberProfile');
const MemberActivity = require('./MemberActivity');
const MemberChangeRequest = require('./MemberChangeRequest');
const MemberMinistryRole = require('./MemberMinistryRole');

// Volunteers
const Volunteer = require('./Volunteer');

// Events
const Event = require('./Event');
const EventTimeline = require('./EventTimeline');
const EventRegistration = require('./EventRegistration');

// Attendance
const AttendanceSession = require('./AttendanceSession');
const AttendanceCheckin = require('./AttendanceCheckin');

// Communication
const Announcement = require('./Announcement');
const AnnouncementRead = require('./AnnouncementRead');
const BulletinItem = require('./BulletinItem');
const InternalMessage = require('./InternalMessage');
const SmsTemplate = require('./SmsTemplate');
const EmailSubscription = require('./EmailSubscription');
const GroupMessage = require('./GroupMessage');
const DiscussionForum = require('./DiscussionForum');
const ForumPost = require('./ForumPost');

// Content
const Achievement = require('./Achievement');
const HeroSlide = require('./HeroSlide');
const SystemSetting = require('./SystemSetting');
const BlueCard = require('./BlueCard');
const MissionWord = require('./MissionWord');

// Admin
const AuditLog = require('./AuditLog');
const AdminActivityLog = require('./AdminActivityLog');


// Prayer & Counseling
const PrayerRequest = require('./PrayerRequest');
const CounselingRequest = require('./CounselingRequest');

// Training & Development
const Course = require('./Course');
const Lesson = require('./Lesson');
const Quiz = require('./Quiz');
const QuizAttempt = require('./QuizAttempt');
const Certificate = require('./Certificate');

// Small Groups
const SmallGroup = require('./SmallGroup');
const GroupMember = require('./GroupMember');
const SpecialNeed = require('./SpecialNeed');
const PrivacyConsent = require('./PrivacyConsent');

// Document Management
const Document = require('./Document');

// Notifications
const Notification = require('./Notification');

// Volunteer Management
const ServiceHour = require('./ServiceHour');
const VolunteerRecognition = require('./VolunteerRecognition');
const VolunteerAvailability = require('./VolunteerAvailability');
const Task = require('./Task');

const models = {
  User, Role, Permission, UserPermission, PasswordReset, OTPVerification, LoginSession,
  Union, Field, District, Church, Ministry,
  Member, MemberProfile, MemberActivity, MemberChangeRequest, MemberMinistryRole,
  Volunteer,
  Event, EventTimeline, EventRegistration,
  AttendanceSession, AttendanceCheckin,
  Announcement, AnnouncementRead, BulletinItem, InternalMessage, SmsTemplate, EmailSubscription,
  GroupMessage, DiscussionForum, ForumPost,
  Achievement, HeroSlide, SystemSetting, BlueCard, MissionWord,
  AuditLog, AdminActivityLog,
  PrayerRequest, CounselingRequest,
  Course, Lesson, Quiz, QuizAttempt, Certificate,
  SmallGroup, GroupMember, SpecialNeed, PrivacyConsent,
  Document, Notification,
  ServiceHour, VolunteerRecognition, VolunteerAvailability,
  Task,
};

const setupAssociations = () => {
  logger.info('Setting up model associations...');

  // User -> Role
  User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
  Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

  // User -> UserPermission (through)
  User.belongsToMany(Permission, { through: UserPermission, foreignKey: 'userId', as: 'permissions' });
  Permission.belongsToMany(User, { through: UserPermission, foreignKey: 'permissionId', as: 'users' });
  UserPermission.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  UserPermission.belongsTo(Permission, { foreignKey: 'permissionId', as: 'permission' });

  // User -> Union/Field/District/Church/Ministry
  User.belongsTo(Union, { foreignKey: 'unionId', as: 'union' });
  User.belongsTo(Field, { foreignKey: 'fieldId', as: 'field' });
  User.belongsTo(District, { foreignKey: 'districtId', as: 'district' });
  User.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
  User.belongsTo(Ministry, { foreignKey: 'ministryId', as: 'ministry' });

  // Auth: PasswordReset, OTPVerification, LoginSession -> User
  PasswordReset.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  OTPVerification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  LoginSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Church Hierarchy: Union -> Field -> District -> Church
  Union.hasMany(Field, { foreignKey: 'unionId', as: 'fields' });
  Field.belongsTo(Union, { foreignKey: 'unionId', as: 'union' });

  Field.hasMany(District, { foreignKey: 'fieldId', as: 'districts' });
  District.belongsTo(Field, { foreignKey: 'fieldId', as: 'field' });

  District.hasMany(Church, { foreignKey: 'districtId', as: 'churches' });
  Church.belongsTo(District, { foreignKey: 'districtId', as: 'district' });

  // Church -> Field
  Church.belongsTo(Field, { foreignKey: 'fieldId', as: 'field' });
  Field.hasMany(Church, { foreignKey: 'fieldId', as: 'churches' });

  // Church -> Ministry
  Church.hasMany(Ministry, { foreignKey: 'churchId', as: 'ministries' });
  Ministry.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });

  // Volunteer -> User
  Volunteer.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  User.hasOne(Volunteer, { foreignKey: 'userId', as: 'volunteer' });

  // Member relationships
  Member.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
  Church.hasMany(Member, { foreignKey: 'churchId', as: 'members' });

  Member.hasOne(MemberProfile, { foreignKey: 'memberId', as: 'profile' });
  MemberProfile.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  Member.hasMany(MemberActivity, { foreignKey: 'memberId', as: 'activities' });
  MemberActivity.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  MemberChangeRequest.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
  MemberChangeRequest.belongsTo(User, { foreignKey: 'submittedBy', as: 'submittedByUser' });

  // Member -> Ministry Roles (many-to-many)
  Member.hasMany(MemberMinistryRole, { foreignKey: 'memberId', as: 'ministryRoles', onDelete: 'CASCADE' });
  MemberMinistryRole.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  // Event relationships
  Event.hasMany(EventTimeline, { foreignKey: 'eventId', as: 'timeline' });
  EventTimeline.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });

  Event.hasMany(EventRegistration, { foreignKey: 'eventId', as: 'registrations' });
  EventRegistration.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
  EventRegistration.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });

  Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  // Attendance
  AttendanceSession.hasMany(AttendanceCheckin, { foreignKey: 'sessionId', as: 'checkins' });
  AttendanceCheckin.belongsTo(AttendanceSession, { foreignKey: 'sessionId', as: 'session' });
  AttendanceSession.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  // Announcements
  Announcement.hasMany(AnnouncementRead, { foreignKey: 'announcementId', as: 'reads' });
  AnnouncementRead.belongsTo(Announcement, { foreignKey: 'announcementId', as: 'announcement' });
  AnnouncementRead.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Announcement.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

  // Bulletin
  BulletinItem.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

  // Messages
  InternalMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
  InternalMessage.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });

  // BlueCard -> MissionWord
  BlueCard.hasMany(MissionWord, { foreignKey: 'cardId', as: 'missionWords' });
  MissionWord.belongsTo(BlueCard, { foreignKey: 'cardId', as: 'card' });

  // Audit / Activity
  AuditLog.belongsTo(User, { foreignKey: 'actor', as: 'actorUser' });
  AdminActivityLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // NEW ASSOCIATIONS

  // GroupMessage
  GroupMessage.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  GroupMessage.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
  GroupMessage.belongsTo(Ministry, { foreignKey: 'ministryId', as: 'ministry' });

  // DiscussionForum -> ForumPost
  DiscussionForum.hasMany(ForumPost, { foreignKey: 'forumId', as: 'posts' });
  ForumPost.belongsTo(DiscussionForum, { foreignKey: 'forumId', as: 'forum' });
  ForumPost.belongsTo(User, { foreignKey: 'userId', as: 'author' });
  ForumPost.belongsTo(ForumPost, { foreignKey: 'parentId', as: 'parent' });
  DiscussionForum.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  DiscussionForum.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
  DiscussionForum.belongsTo(Ministry, { foreignKey: 'ministryId', as: 'ministry' });

  // PrayerRequest
  PrayerRequest.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
  PrayerRequest.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  PrayerRequest.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });

  // CounselingRequest
  CounselingRequest.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
  CounselingRequest.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  CounselingRequest.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });

  // Course -> Lesson
  Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons' });
  Lesson.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
  Course.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Course.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });

  // Lesson -> Quiz
  Lesson.hasOne(Quiz, { foreignKey: 'lessonId', as: 'quiz' });
  Quiz.belongsTo(Lesson, { foreignKey: 'lessonId', as: 'lesson' });

  // Quiz -> QuizAttempt
  Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
  QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId', as: 'quiz' });
  QuizAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Certificate
  Certificate.belongsTo(User, { foreignKey: 'userId', as: 'user' });
  Certificate.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });
  Certificate.belongsTo(User, { foreignKey: 'issuedBy', as: 'issuer' });

  // Document
  Document.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
  Document.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });
  Document.belongsTo(Ministry, { foreignKey: 'ministryId', as: 'ministry' });

  // Notification
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // ServiceHour
  ServiceHour.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });
  ServiceHour.belongsTo(Event, { foreignKey: 'eventId', as: 'event' });
  ServiceHour.belongsTo(Ministry, { foreignKey: 'ministryId', as: 'ministry' });
  ServiceHour.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

  // VolunteerRecognition
  VolunteerRecognition.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });
  VolunteerRecognition.belongsTo(User, { foreignKey: 'awardedBy', as: 'awarder' });

  // VolunteerAvailability
  VolunteerAvailability.belongsTo(User, { foreignKey: 'volunteerId', as: 'volunteer' });

  // Task associations
  Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });
  Task.belongsTo(User, { foreignKey: 'assignedBy', as: 'assigner' });

  // SmallGroup associations
  SmallGroup.hasMany(GroupMember, { foreignKey: 'groupId', as: 'members' });
  GroupMember.belongsTo(SmallGroup, { foreignKey: 'groupId', as: 'group' });
  GroupMember.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
  SmallGroup.belongsTo(Church, { foreignKey: 'churchId', as: 'church' });

  // SpecialNeed associations
  SpecialNeed.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
  Member.hasMany(SpecialNeed, { foreignKey: 'memberId', as: 'specialNeeds' });

  // PrivacyConsent associations
  PrivacyConsent.belongsTo(Member, { foreignKey: 'memberId', as: 'member' });
  Member.hasMany(PrivacyConsent, { foreignKey: 'memberId', as: 'privacyConsents' });

  logger.info('All associations established');
};

module.exports = { ...models, setupAssociations, sequelize };
