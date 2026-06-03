import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  MOCK_ANNOUNCEMENTS,
  MOCK_BULLETIN,
  MOCK_MESSAGES,
  MOCK_SMS_TEMPLATES,
  MOCK_AUDIT_LOGS,
} from '@/data/enterpriseMocks';
import { useAuthStore } from '@/store/useAuthStore';
import { canSenderTarget, ROLE_LABELS } from '@/utils/announcementPermissions';
import type { Announcement, AnnouncementPriority, AnnouncementCategory, Attachment } from '@/types/communication';
import type { UserRole } from '@/constants/routes';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const keys = {
  announcements: ['comms', 'announcements'] as const,
  reads: ['comms', 'reads'] as const,
  bulletin: ['comms', 'bulletin'] as const,
  messages: ['comms', 'messages'] as const,
  sms: ['comms', 'sms'] as const,
};

export function useAnnouncements() {
  return useQuery({
    queryKey: keys.announcements,
    queryFn: async () => {
      await delay(300);
      return [...MOCK_ANNOUNCEMENTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
    },
  });
}

export function useBulletin() {
  return useQuery({
    queryKey: keys.bulletin,
    queryFn: async () => {
      await delay(280);
      return [...MOCK_BULLETIN].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt.localeCompare(a.updatedAt);
      });
    },
  });
}

export function useInternalMessages() {
  return useQuery({
    queryKey: keys.messages,
    queryFn: async () => {
      await delay(320);
      return [...MOCK_MESSAGES].sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    },
  });
}

export function useSmsTemplates() {
  return useQuery({
    queryKey: keys.sms,
    queryFn: async () => {
      await delay(250);
      return [...MOCK_SMS_TEMPLATES];
    },
  });
}

export function useMarkMessageRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      await delay(200);
      const m = MOCK_MESSAGES.find((x) => x.id === messageId);
      if (m) m.read = true;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.messages }),
  });
}

export function useSendInternalMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { subject: string; preview: string; toName: string }) => {
      await delay(450);
      MOCK_MESSAGES.unshift({
        id: `m-${Date.now()}`,
        threadId: `t-${Date.now()}`,
        fromName: 'You',
        toName: payload.toName,
        subject: payload.subject,
        preview: payload.preview,
        sentAt: new Date().toISOString(),
        read: true,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.messages }),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: {
      title: string;
      body: string;
      priority: AnnouncementPriority;
      category: AnnouncementCategory;
      targetRole: UserRole;
      targetId?: string;
      scheduledAt?: string;
      attachments?: Attachment[];
    }) => {
      await delay(400);
      if (!user) throw new Error('Not authenticated');
      if (!canSenderTarget(user.role as UserRole, payload.targetRole)) {
        throw new Error('You are not allowed to send announcements to this role');
      }

      const targetLabel = ROLE_LABELS[payload.targetRole] || payload.targetRole;

      const newAnnouncement: Announcement = {
        id: `an-${Date.now()}`,
        title: payload.title,
        body: payload.body,
        priority: payload.priority,
        category: payload.category,
        publishedAt: new Date().toISOString(),
        scheduledAt: payload.scheduledAt,
        author: user.name || 'Leader',
        authorRole: user.role,
        targetRole: payload.targetRole,
        targetId: payload.targetId,
        audience: targetLabel,
        senderId: user.id,
        unionId: user.unionId,
        fieldId: user.fieldId,
        districtId: user.districtId,
        churchId: user.churchId,
        ministryId: user.ministryId,
        attachments: payload.attachments,
      };

      MOCK_ANNOUNCEMENTS.unshift(newAnnouncement);
      MOCK_AUDIT_LOGS.unshift({
        id: `aud-${Date.now()}`,
        actor: user.email || user.name || 'Unknown',
        action: 'ANNOUNCEMENT_PUBLISHED',
        target: newAnnouncement.id,
        at: new Date().toISOString(),
        severity: 'INFO',
      });
      return newAnnouncement;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.announcements });
    },
  });
}

export function useHierarchicalAnnouncements() {
  const { user } = useAuthStore();
  const query = useAnnouncements();

  const filtered = query.data?.filter((a) => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN') return true;

    switch (user.role) {
      case 'UNION_LEADER': {
        const fromSelf = a.authorRole === 'UNION_LEADER' && a.unionId === user.unionId;
        const fromSuperAdmin = a.authorRole === 'SUPER_ADMIN';
        const targetsMe = a.targetRole === 'UNION_LEADER';
        return fromSelf || fromSuperAdmin || (targetsMe && a.unionId === user.unionId);
      }
      case 'FIELD_LEADER': {
        const fromSelf = a.authorRole === 'FIELD_LEADER' && a.fieldId === user.fieldId;
        const fromUnion = a.authorRole === 'UNION_LEADER' && a.unionId === user.unionId;
        const fromSuperAdmin = a.authorRole === 'SUPER_ADMIN';
        const targetsMe = a.targetRole === 'FIELD_LEADER';
        return fromSelf || fromUnion || fromSuperAdmin || (targetsMe && a.fieldId === user.fieldId);
      }
      case 'DISTRICT_LEADER': {
        const fromSelf = a.authorRole === 'DISTRICT_LEADER' && a.districtId === user.districtId;
        const fromConference = a.authorRole === 'FIELD_LEADER' && a.fieldId === user.fieldId;
        const fromUnion = a.authorRole === 'UNION_LEADER' && a.unionId === user.unionId;
        const fromSuperAdmin = a.authorRole === 'SUPER_ADMIN';
        const targetsMe = a.targetRole === 'DISTRICT_LEADER';
        return fromSelf || fromConference || fromUnion || fromSuperAdmin || (targetsMe && a.districtId === user.districtId);
      }
      case 'CHURCH_LEADER': {
        const fromSelf = a.authorRole === 'CHURCH_LEADER' && a.churchId === user.churchId;
        const fromDistrict = a.authorRole === 'DISTRICT_LEADER' && a.districtId === user.districtId;
        const fromConference = a.authorRole === 'FIELD_LEADER' && a.fieldId === user.fieldId;
        const fromUnion = a.authorRole === 'UNION_LEADER' && a.unionId === user.unionId;
        const fromSuperAdmin = a.authorRole === 'SUPER_ADMIN';
        return fromSelf || fromDistrict || fromConference || fromUnion || fromSuperAdmin;
      }
      case 'MINISTRY_LEADER': {
        const fromSelf = a.authorRole === 'MINISTRY_LEADER' && a.churchId === user.churchId;
        const fromChurch = a.authorRole === 'CHURCH_LEADER' && a.churchId === user.churchId;
        const fromDistrict = a.authorRole === 'DISTRICT_LEADER' && a.districtId === user.districtId;
        const fromConference = a.authorRole === 'FIELD_LEADER' && a.fieldId === user.fieldId;
        const fromUnion = a.authorRole === 'UNION_LEADER' && a.unionId === user.unionId;
        const fromSuperAdmin = a.authorRole === 'SUPER_ADMIN';
        return fromSelf || fromChurch || fromDistrict || fromConference || fromUnion || fromSuperAdmin;
      }
      case 'MEMBER': {
        const isMine = a.churchId === user.churchId;
        const fromLeader = a.authorRole === 'CHURCH_LEADER' || a.authorRole === 'MINISTRY_LEADER';
        const fromUpper = ['DISTRICT_LEADER', 'FIELD_LEADER', 'UNION_LEADER', 'SUPER_ADMIN'].includes(a.authorRole);
        return isMine && (fromLeader || fromUpper);
      }
      case 'VOLUNTEER': {
        const isMyMinistry = a.ministryId && a.ministryId === user.ministryId;
        const fromMinistry = a.authorRole === 'MINISTRY_LEADER';
        const fromChurch = a.authorRole === 'CHURCH_LEADER' && a.churchId === user.churchId;
        const fromUpper = ['DISTRICT_LEADER', 'FIELD_LEADER', 'UNION_LEADER', 'SUPER_ADMIN'].includes(a.authorRole);
        return (isMyMinistry && fromMinistry) || fromChurch || fromUpper;
      }
      default:
        return false;
    }
  }) || [];

  return {
    ...query,
    data: filtered,
  };
}

export function useMarkAnnouncementRead() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      await delay(100);
      const a = MOCK_ANNOUNCEMENTS.find((x) => x.id === announcementId);
      if (a) a.isRead = true;
      if (user) {
        MOCK_AUDIT_LOGS.unshift({
          id: `aud-${Date.now()}`,
          actor: user.email || user.name || 'Unknown',
          action: 'ANNOUNCEMENT_READ',
          target: announcementId,
          at: new Date().toISOString(),
          severity: 'INFO',
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.announcements }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (announcementId: string) => {
      await delay(300);
      const idx = MOCK_ANNOUNCEMENTS.findIndex((a) => a.id === announcementId);
      if (idx === -1) throw new Error('Announcement not found');
      MOCK_ANNOUNCEMENTS.splice(idx, 1);
      if (user) {
        MOCK_AUDIT_LOGS.unshift({
          id: `aud-${Date.now()}`,
          actor: user.email || user.name || 'Unknown',
          action: 'ANNOUNCEMENT_DELETED',
          target: announcementId,
          at: new Date().toISOString(),
          severity: 'INFO',
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.announcements }),
  });
}
