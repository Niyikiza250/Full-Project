export type AchievementKind = 'STORY' | 'GALLERY' | 'MILESTONE' | 'TESTIMONY' | 'NEWS';
export type AchievementStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface AchievementItem {
  id: string;
  kind: AchievementKind;
  title: string;
  summary: string;
  coverUrl?: string;
  publishedAt: string;
  author: string;
  tags: string[];
  status: AchievementStatus;
  submittedBy?: string;
  submittedByRole?: string;
  /** gallery image URLs when kind is GALLERY */
  galleryUrls?: string[];
}
