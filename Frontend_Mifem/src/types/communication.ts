export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type AnnouncementCategory = 'GENERAL' | 'TRAINING' | 'SPIRITUAL' | 'FINANCE' | 'YOUTH';

export interface Attachment {
  name: string;
  size: string;
  type: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  category: AnnouncementCategory;
  publishedAt: string;
  scheduledAt?: string;
  author: string;
  authorRole: string;
  targetRole: string;
  targetId?: string;
  audience: string;
  senderId?: string;
  unionId?: string;
  fieldId?: string;
  districtId?: string;
  churchId?: string;
  ministryId?: string;
  attachments?: Attachment[];
  isRead?: boolean;
}

export interface AnnouncementRead {
  id: string;
  announcementId: string;
  userId: string;
  isRead: boolean;
  readAt?: string;
}

export interface BulletinItem {
  id: string;
  title: string;
  excerpt: string;
  pinned: boolean;
  updatedAt: string;
  category: string;
}

export interface InternalMessage {
  id: string;
  threadId: string;
  fromName: string;
  toName: string;
  subject: string;
  preview: string;
  sentAt: string;
  read: boolean;
}

export interface SmsTemplate {
  id: string;
  name: string;
  body: string;
  lastUsed?: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';

export interface SystemNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  createdAt: string;
  actionUrl?: string;
}
