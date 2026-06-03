export interface FieldReport {
  membership: string;
  baptisms: string;
  groups: string;
  volunteers: string;
  membershipDelta: string;
  baptismsDelta: string;
  groupsDelta: string;
  volunteersDelta: string;
  districts: number;
  churches: number;
  ministry: { name: string; value: number }[];
  combined: { m: string; worship: number; ss: number; outreach: number }[];
}

export const FIELD_REPORTS: Record<string, FieldReport> = {
  FR1: {
    membership: '8,420', baptisms: '386', groups: '520', volunteers: '1,840',
    membershipDelta: '+3.2%', baptismsDelta: '+18', groupsDelta: '+9', volunteersDelta: '+5%',
    districts: 3, churches: 42,
    ministry: [
      { name: 'Sabbath School', value: 98 },
      { name: 'Youth', value: 72 },
      { name: 'Health', value: 54 },
      { name: 'Stewardship', value: 38 },
      { name: 'Publishing', value: 29 },
    ],
    combined: [
      { m: 'Jan', worship: 198, ss: 128, outreach: 48 },
      { m: 'Feb', worship: 202, ss: 132, outreach: 52 },
      { m: 'Mar', worship: 206, ss: 136, outreach: 55 },
      { m: 'Apr', worship: 204, ss: 138, outreach: 58 },
      { m: 'May', worship: 210, ss: 142, outreach: 62 },
    ],
  },
  FR2: {
    membership: '6,150', baptisms: '274', groups: '380', volunteers: '1,210',
    membershipDelta: '+2.8%', baptismsDelta: '+12', groupsDelta: '+7', volunteersDelta: '+4%',
    districts: 2, churches: 31,
    ministry: [
      { name: 'Sabbath School', value: 72 },
      { name: 'Youth', value: 55 },
      { name: 'Health', value: 42 },
      { name: 'Stewardship', value: 28 },
      { name: 'Publishing', value: 21 },
    ],
    combined: [
      { m: 'Jan', worship: 152, ss: 96, outreach: 36 },
      { m: 'Feb', worship: 156, ss: 100, outreach: 40 },
      { m: 'Mar', worship: 160, ss: 104, outreach: 43 },
      { m: 'Apr', worship: 158, ss: 106, outreach: 45 },
      { m: 'May', worship: 164, ss: 108, outreach: 48 },
    ],
  },
  FR3: {
    membership: '5,820', baptisms: '218', groups: '340', volunteers: '1,050',
    membershipDelta: '+2.5%', baptismsDelta: '+10', groupsDelta: '+5', volunteersDelta: '+3%',
    districts: 2, churches: 28,
    ministry: [
      { name: 'Sabbath School', value: 64 },
      { name: 'Youth', value: 48 },
      { name: 'Health', value: 36 },
      { name: 'Stewardship', value: 24 },
      { name: 'Publishing', value: 18 },
    ],
    combined: [
      { m: 'Jan', worship: 138, ss: 86, outreach: 30 },
      { m: 'Feb', worship: 142, ss: 90, outreach: 34 },
      { m: 'Mar', worship: 146, ss: 92, outreach: 36 },
      { m: 'Apr', worship: 144, ss: 94, outreach: 38 },
      { m: 'May', worship: 150, ss: 96, outreach: 40 },
    ],
  },
  FR4: {
    membership: '4,930', baptisms: '192', groups: '290', volunteers: '960',
    membershipDelta: '+2.2%', baptismsDelta: '+9', groupsDelta: '+4', volunteersDelta: '+3%',
    districts: 2, churches: 24,
    ministry: [
      { name: 'Sabbath School', value: 56 },
      { name: 'Youth', value: 42 },
      { name: 'Health', value: 32 },
      { name: 'Stewardship', value: 20 },
      { name: 'Publishing', value: 16 },
    ],
    combined: [
      { m: 'Jan', worship: 120, ss: 78, outreach: 28 },
      { m: 'Feb', worship: 124, ss: 80, outreach: 30 },
      { m: 'Mar', worship: 128, ss: 84, outreach: 32 },
      { m: 'Apr', worship: 126, ss: 86, outreach: 34 },
      { m: 'May', worship: 130, ss: 88, outreach: 36 },
    ],
  },
  FR5: {
    membership: '7,240', baptisms: '312', groups: '460', volunteers: '1,520',
    membershipDelta: '+3.0%', baptismsDelta: '+15', groupsDelta: '+8', volunteersDelta: '+4%',
    districts: 2, churches: 36,
    ministry: [
      { name: 'Sabbath School', value: 84 },
      { name: 'Youth', value: 62 },
      { name: 'Health', value: 48 },
      { name: 'Stewardship', value: 32 },
      { name: 'Publishing', value: 24 },
    ],
    combined: [
      { m: 'Jan', worship: 172, ss: 106, outreach: 42 },
      { m: 'Feb', worship: 176, ss: 110, outreach: 46 },
      { m: 'Mar', worship: 180, ss: 114, outreach: 48 },
      { m: 'Apr', worship: 178, ss: 116, outreach: 50 },
      { m: 'May', worship: 184, ss: 118, outreach: 52 },
    ],
  },
  FR6: {
    membership: '5,460', baptisms: '204', groups: '310', volunteers: '980',
    membershipDelta: '+2.6%', baptismsDelta: '+11', groupsDelta: '+6', volunteersDelta: '+3%',
    districts: 2, churches: 27,
    ministry: [
      { name: 'Sabbath School', value: 62 },
      { name: 'Youth', value: 46 },
      { name: 'Health', value: 34 },
      { name: 'Stewardship', value: 22 },
      { name: 'Publishing', value: 17 },
    ],
    combined: [
      { m: 'Jan', worship: 130, ss: 82, outreach: 32 },
      { m: 'Feb', worship: 134, ss: 86, outreach: 34 },
      { m: 'Mar', worship: 138, ss: 88, outreach: 36 },
      { m: 'Apr', worship: 136, ss: 90, outreach: 38 },
      { m: 'May', worship: 140, ss: 92, outreach: 40 },
    ],
  },
  FR7: {
    membership: '4,680', baptisms: '176', groups: '260', volunteers: '840',
    membershipDelta: '+2.0%', baptismsDelta: '+8', groupsDelta: '+4', volunteersDelta: '+2%',
    districts: 2, churches: 22,
    ministry: [
      { name: 'Sabbath School', value: 52 },
      { name: 'Youth', value: 38 },
      { name: 'Health', value: 28 },
      { name: 'Stewardship', value: 18 },
      { name: 'Publishing', value: 14 },
    ],
    combined: [
      { m: 'Jan', worship: 110, ss: 68, outreach: 24 },
      { m: 'Feb', worship: 114, ss: 72, outreach: 26 },
      { m: 'Mar', worship: 118, ss: 74, outreach: 28 },
      { m: 'Apr', worship: 116, ss: 76, outreach: 30 },
      { m: 'May', worship: 120, ss: 78, outreach: 32 },
    ],
  },
  FR8: {
    membership: '5,554', baptisms: '296', groups: '320', volunteers: '1,175',
    membershipDelta: '+2.4%', baptismsDelta: '+14', groupsDelta: '+5', volunteersDelta: '+3%',
    districts: 2, churches: 26,
    ministry: [
      { name: 'Sabbath School', value: 60 },
      { name: 'Youth', value: 44 },
      { name: 'Health', value: 34 },
      { name: 'Stewardship', value: 22 },
      { name: 'Publishing', value: 16 },
    ],
    combined: [
      { m: 'Jan', worship: 124, ss: 78, outreach: 28 },
      { m: 'Feb', worship: 128, ss: 80, outreach: 30 },
      { m: 'Mar', worship: 132, ss: 84, outreach: 32 },
      { m: 'Apr', worship: 130, ss: 86, outreach: 34 },
      { m: 'May', worship: 134, ss: 88, outreach: 36 },
    ],
  },
};
