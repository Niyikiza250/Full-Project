import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BlueCardContent, MissionWord } from '@/types/blueCard';

const DEFAULT_BLUECARD: BlueCardContent = {
  id: 'default',
  congregationLabel: 'Kigali Central Congregation',
  mainTitle: 'Active Sabbath Fellowship',
  welcomeMessage: 'Welcome to your member portal. Access local announcements, track your attendance, and discover upcoming small groups.',
  missionWordsLabel: 'MIFEM MOTO',
  missionWords: [
    { id: 'mw1', title: 'MIFEM MIFEM FEEGO', body: 'Duhanze amaso YESU, tuzabiba imbuto nziza tudacogora.' },
    { id: 'mw2', title: 'MIFEM MIFEM JUNIOR', body: "Impagarike yawe n'ubwenge bwawe, bishyire mu biganza by'iyaguhanze, uzaba igiti cyiza kigaba amashami." },
  ],
};

interface BlueCardState {
  cards: BlueCardContent[];
  activeCardId: string;
  setActiveCard: (id: string) => void;
  getActiveCard: () => BlueCardContent | undefined;
  addCard: (card: Omit<BlueCardContent, 'id'>) => void;
  updateCard: (id: string, updates: Partial<BlueCardContent>) => void;
  deleteCard: (id: string) => void;
  addMissionWord: (cardId: string, word: Omit<MissionWord, 'id'>) => void;
  updateMissionWord: (cardId: string, wordId: string, updates: Partial<MissionWord>) => void;
  deleteMissionWord: (cardId: string, wordId: string) => void;
}

export const useBlueCardStore = create<BlueCardState>()(
  persist(
    (set, get) => ({
      cards: [DEFAULT_BLUECARD],
      activeCardId: 'default',

      setActiveCard: (id) => set({ activeCardId: id }),

      getActiveCard: () => get().cards.find((c) => c.id === get().activeCardId),

      addCard: (card) => {
        const id = `card_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({ cards: [...state.cards, { ...card, id }], activeCardId: id }));
      },

      updateCard: (id, updates) => {
        set((state) => ({
          cards: state.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        }));
      },

      deleteCard: (id) => {
        set((state) => {
          const filtered = state.cards.filter((c) => c.id !== id);
          return {
            cards: filtered,
            activeCardId: state.activeCardId === id
              ? (filtered[0]?.id ?? 'default')
              : state.activeCardId,
          };
        });
      },

      addMissionWord: (cardId, word) => {
        const id = `mw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, missionWords: [...c.missionWords, { ...word, id }] }
              : c
          ),
        }));
      },

      updateMissionWord: (cardId, wordId, updates) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  missionWords: c.missionWords.map((w) =>
                    w.id === wordId ? { ...w, ...updates } : w
                  ),
                }
              : c
          ),
        }));
      },

      deleteMissionWord: (cardId, wordId) => {
        set((state) => ({
          cards: state.cards.map((c) =>
            c.id === cardId
              ? { ...c, missionWords: c.missionWords.filter((w) => w.id !== wordId) }
              : c
          ),
        }));
      },
    }),
    {
      name: 'mifem-bluecard-storage',
    }
  )
);
