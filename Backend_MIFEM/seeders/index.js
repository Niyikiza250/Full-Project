const { sequelize } = require('../config/db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const SystemSetting = require('../models/SystemSetting');
const HeroSlide = require('../models/HeroSlide');
const Achievement = require('../models/Achievement');
const BlueCard = require('../models/BlueCard');
const MissionWord = require('../models/MissionWord');
const logger = require('../utils/logger');

const seed = async () => {
  logger.info('=== Seeding Database ===');

  // 1. Seed Roles
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system access', hierarchy: 1 },
    { name: 'UNION_LEADER', description: 'Union level administrator', hierarchy: 2 },
    { name: 'FIELD_ADMINISTRATOR', description: 'Field level administrator', hierarchy: 3 },
    { name: 'FIELD_LEADER', description: 'Field leader', hierarchy: 4 },
    { name: 'DISTRICT_LEADER', description: 'District leader', hierarchy: 5 },
    { name: 'CHURCH_LEADER', description: 'Church leader', hierarchy: 6 },
    { name: 'MINISTRY_LEADER', description: 'Ministry leader', hierarchy: 7 },
    { name: 'VOLUNTEER', description: 'Volunteer', hierarchy: 8 },
    { name: 'MEMBER', description: 'Regular member', hierarchy: 9 },
  ];

  for (const roleData of roles) {
    await Role.findOrCreate({
      where: { name: roleData.name },
      defaults: roleData,
    });
  }
  logger.info(`Roles seeded: ${roles.length}`);

  // 2. Seed Permissions
  const permissions = [
    { name: 'manage_users', description: 'Create, edit, delete users', group: 'Administration' },
    { name: 'manage_roles', description: 'Create, edit, delete roles', group: 'Administration' },
    { name: 'manage_members', description: 'Manage member records', group: 'Members' },
    { name: 'manage_events', description: 'Create, edit, delete events', group: 'Events' },
    { name: 'manage_attendance', description: 'Manage attendance sessions', group: 'Attendance' },
    { name: 'manage_announcements', description: 'Create, edit, delete announcements', group: 'Communication' },
    { name: 'manage_messages', description: 'Send internal messages', group: 'Communication' },
    { name: 'manage_blue_cards', description: 'Manage blue cards', group: 'Content' },
    { name: 'manage_achievements', description: 'Manage achievements', group: 'Content' },
    { name: 'manage_hero_slides', description: 'Manage hero slides', group: 'Content' },
    { name: 'manage_settings', description: 'Manage system settings', group: 'Administration' },
    { name: 'view_reports', description: 'View reports and analytics', group: 'Reports' },
    { name: 'export_data', description: 'Export data to CSV/Excel', group: 'Reports' },
    { name: 'manage_churches', description: 'Manage church structure', group: 'Administration' },
    { name: 'excel_import', description: 'Import users via Excel', group: 'Administration' },
    { name: 'manage_prayer_requests', description: 'Manage prayer requests', group: 'Prayer & Counseling' },
    { name: 'manage_counseling', description: 'Manage counseling requests', group: 'Prayer & Counseling' },
    { name: 'view_prayer_requests', description: 'View prayer requests', group: 'Prayer & Counseling' },
    { name: 'manage_courses', description: 'Manage training courses', group: 'Training' },
    { name: 'manage_lessons', description: 'Manage course lessons', group: 'Training' },
    { name: 'manage_quizzes', description: 'Manage quizzes', group: 'Training' },
    { name: 'issue_certificates', description: 'Issue certificates', group: 'Training' },
    { name: 'manage_documents', description: 'Manage documents', group: 'Documents' },
    { name: 'view_documents', description: 'View documents', group: 'Documents' },
    { name: 'manage_notifications', description: 'Manage notifications', group: 'Notifications' },
    { name: 'manage_groups', description: 'Manage group messages', group: 'Communication' },
    { name: 'manage_forums', description: 'Manage discussion forums', group: 'Communication' },
    { name: 'manage_service_hours', description: 'Manage volunteer service hours', group: 'Volunteers' },
    { name: 'approve_service_hours', description: 'Approve service hours', group: 'Volunteers' },
    { name: 'manage_recognition', description: 'Manage volunteer recognition', group: 'Volunteers' },
  ];

  for (const permData of permissions) {
    await Permission.findOrCreate({
      where: { name: permData.name },
      defaults: permData,
    });
  }
  logger.info(`Permissions seeded: ${permissions.length}`);

  // 3. Seed Default Settings
  const defaultSettings = [
    { key: 'language', value: 'en' },
    { key: 'theme', value: 'light' },
    { key: 'fontSize', value: 16 },
    { key: 'appName', value: 'MIFEM' },
  ];

  for (const setting of defaultSettings) {
    await SystemSetting.findOrCreate({
      where: { key: setting.key },
      defaults: setting,
    });
  }
  logger.info(`Default settings seeded: ${defaultSettings.length}`);

  // 4. Seed Demo Hero Slides
  const demoslides = [
    {
      id: 'slide-1',
      title: 'Welcome to MIFEM',
      description: 'Empowering communities through faith and service',
      bgColor: 'bg-slate-900',
      overlayFrom: 'from-slate-900/80',
      overlayTo: 'to-slate-950/60',
      active: true,
      sortOrder: 0,
      primaryCta: { label: 'Learn More', href: '/about' },
    },
    {
      id: 'slide-2',
      title: 'Join Our Community',
      description: 'Together we can make a difference',
      bgColor: 'bg-blue-900',
      overlayFrom: 'from-blue-900/80',
      overlayTo: 'to-blue-950/60',
      active: true,
      sortOrder: 1,
      primaryCta: { label: 'Get Involved', href: '/volunteer' },
    },
  ];

  for (const slide of demoslides) {
    await HeroSlide.findOrCreate({
      where: { id: slide.id },
      defaults: slide,
    });
  }
  logger.info('Demo hero slides seeded');

  // 5. Seed Demo Achievements
  const demoAchievements = [
    {
      id: 'achievement-1',
      kind: 'STORY',
      title: 'Community Outreach 2024',
      summary: 'Over 500 families reached through our community outreach program',
      author: 'MIFEM Admin',
      tags: ['outreach', 'community', '2024'],
      status: 'APPROVED',
      isCustom: false,
    },
    {
      id: 'achievement-2',
      kind: 'GALLERY',
      title: 'Youth Conference',
      summary: 'Annual youth conference gathering',
      author: 'MIFEM Admin',
      tags: ['youth', 'conference'],
      status: 'APPROVED',
      isCustom: false,
    },
    {
      id: 'achievement-3',
      kind: 'TESTIMONY',
      title: 'Faith in Action',
      summary: 'Testimonies of transformed lives',
      author: 'MIFEM Admin',
      tags: ['testimony', 'faith'],
      status: 'APPROVED',
      isCustom: false,
    },
  ];

  for (const ach of demoAchievements) {
    await Achievement.findOrCreate({
      where: { id: ach.id },
      defaults: ach,
    });
  }
  logger.info('Demo achievements seeded');

  // 6. Seed Demo Blue Card
  const [card] = await BlueCard.findOrCreate({
    where: { congregationLabel: 'Our Congregation' },
    defaults: {
      congregationLabel: 'Our Congregation',
      mainTitle: 'Mission Field',
      welcomeMessage: 'Welcome to our mission family',
      missionWordsLabel: 'Mission Words',
    },
  });

  const missionWords = [
    { cardId: card.id, title: 'Faith', body: 'Faith is the substance of things hoped for', sortOrder: 0 },
    { cardId: card.id, title: 'Service', body: 'Serve one another in love', sortOrder: 1 },
    { cardId: card.id, title: 'Community', body: 'Together in fellowship', sortOrder: 2 },
  ];

  for (const word of missionWords) {
    await MissionWord.findOrCreate({
      where: { cardId: card.id, title: word.title },
      defaults: word,
    });
  }
  logger.info('Demo blue cards and mission words seeded');

  logger.info('=== Seeding Complete ===');
};

module.exports = { seed };
