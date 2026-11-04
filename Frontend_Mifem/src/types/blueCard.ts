export interface MissionWord {
  id: string;
  title: string;
  body: string;
}

export interface BlueCardContent {
  id: string;
  congregationLabel: string;
  mainTitle: string;
  welcomeMessage: string;
  missionWordsLabel: string;
  missionWords: MissionWord[];
}
