import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlueCardStore } from '@/store/useBlueCardStore';
import { X, Plus, Trash2, Save, Edit3, FileText } from 'lucide-react';
import type { BlueCardContent, MissionWord } from '@/types/blueCard';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const BlueCardAdminPanel: React.FC<Props> = ({ open, onClose }) => {
  const { t } = useTranslation();
  const { cards, activeCardId, addCard, updateCard, deleteCard, addMissionWord, updateMissionWord, deleteMissionWord, setActiveCard } = useBlueCardStore();
  const active = cards.find((c) => c.id === activeCardId);

  const [editCard, setEditCard] = useState<BlueCardContent | null>(null);
  const [editingMw, setEditingMw] = useState<{ cardId: string; word: MissionWord } | null>(null);
  const [newMw, setNewMw] = useState<{ cardId: string; title: string; body: string } | null>(null);

  if (!open) return null;

  const startEdit = (card: BlueCardContent) => {
    setEditCard({ ...card, missionWords: [...card.missionWords] });
  };

  const saveCardEdit = () => {
    if (!editCard) return;
    updateCard(editCard.id, {
      congregationLabel: editCard.congregationLabel,
      mainTitle: editCard.mainTitle,
      welcomeMessage: editCard.welcomeMessage,
      missionWordsLabel: editCard.missionWordsLabel,
    });
    setEditCard(null);
  };

  const startAdd = () => {
    addCard({
      congregationLabel: 'New Congregation',
      mainTitle: 'Sabbath Fellowship',
      welcomeMessage: 'Welcome message...',
      missionWordsLabel: 'MIFEM MOTO',
      missionWords: [
        { id: `mw_${Date.now()}`, title: 'New Title', body: 'New message body.' },
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <FileText size={16} className="text-sda-blue" />
            {t('memberDashboard.adminManageCard')}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={startAdd}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sda-blue text-white text-[11px] font-bold hover:bg-sda-blue-dark transition-colors"
            >
              <Plus size={13} />
              {t('common.add')}
            </button>
            <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Card selector */}
        {cards.length > 1 && (
          <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <span className="text-[11px] font-bold text-slate-500">{t('memberDashboard.selectCard')}</span>
            <select
              value={activeCardId}
              onChange={(e) => setActiveCard(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              {cards.map((c) => (
                <option key={c.id} value={c.id}>{c.congregationLabel}</option>
              ))}
            </select>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {active && (
            <>
              {/* Left Section Fields */}
              <section>
                <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  {t('memberDashboard.leftSection')}
                </h3>
                <div className="space-y-3">
                  <EditField
                    label={t('memberDashboard.congregationLabel')}
                    value={editCard?.congregationLabel ?? active.congregationLabel}
                    onChange={(v) => setEditCard((prev) => prev ? { ...prev, congregationLabel: v } : null)}
                  />
                  <EditField
                    label={t('memberDashboard.mainTitle')}
                    value={editCard?.mainTitle ?? active.mainTitle}
                    onChange={(v) => setEditCard((prev) => prev ? { ...prev, mainTitle: v } : null)}
                  />
                  <EditField
                    label={t('memberDashboard.welcomeMessage')}
                    value={editCard?.welcomeMessage ?? active.welcomeMessage}
                    onChange={(v) => setEditCard((prev) => prev ? { ...prev, welcomeMessage: v } : null)}
                    multiline
                  />
                </div>
              </section>

              {/* Right Section Fields */}
              <section>
                <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  {t('memberDashboard.rightSection')}
                </h3>
                <div className="space-y-3">
                  <EditField
                    label={t('memberDashboard.missionWordsLabel')}
                    value={editCard?.missionWordsLabel ?? active.missionWordsLabel}
                    onChange={(v) => setEditCard((prev) => prev ? { ...prev, missionWordsLabel: v } : null)}
                  />
                </div>

                {/* Mission Word Items */}
                <div className="mt-3 space-y-2">
                  {(editCard?.missionWords ?? active.missionWords).map((mw) => (
                    <div key={mw.id} className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                      <div className="flex-1 min-w-0">
                        {editingMw?.word.id === mw.id ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editingMw.word.title}
                              onChange={(e) => setEditingMw((prev) => prev ? { ...prev, word: { ...prev.word, title: e.target.value } } : null)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                              placeholder="Title"
                            />
                            <textarea
                              value={editingMw.word.body}
                              onChange={(e) => setEditingMw((prev) => prev ? { ...prev, word: { ...prev.word, body: e.target.value } } : null)}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 resize-none"
                              rows={2}
                              placeholder="Body text"
                            />
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (editingMw) updateMissionWord(editingMw.cardId, editingMw.word.id, { title: editingMw.word.title, body: editingMw.word.body });
                                  setEditingMw(null);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-sda-blue text-white text-[10px] font-bold"
                              >
                                {t('common.save')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingMw(null)}
                                className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                {t('common.cancel')}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{mw.title}</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{mw.body}</p>
                          </>
                        )}
                      </div>
                      {editingMw?.word.id !== mw.id && (
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => setEditingMw({ cardId: active.id, word: { ...mw } })}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteMissionWord(active.id, mw.id)}
                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add new mission word */}
                  {newMw?.cardId === active.id ? (
                    <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                      <input
                        type="text"
                        value={newMw.title}
                        onChange={(e) => setNewMw((prev) => prev ? { ...prev, title: e.target.value } : null)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-200"
                        placeholder="Mission word title"
                      />
                      <textarea
                        value={newMw.body}
                        onChange={(e) => setNewMw((prev) => prev ? { ...prev, body: e.target.value } : null)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 resize-none"
                        rows={2}
                        placeholder="Mission word body"
                      />
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (newMw && newMw.title.trim()) {
                              addMissionWord(newMw.cardId, { title: newMw.title.trim(), body: newMw.body.trim() });
                            }
                            setNewMw(null);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-sda-blue text-white text-[10px] font-bold"
                        >
                          {t('common.add')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMw(null)}
                          className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setNewMw({ cardId: active.id, title: '', body: '' })}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-sda-blue dark:text-sda-gold hover:underline"
                    >
                      <Plus size={13} />
                      {t('memberDashboard.addMissionWord')}
                    </button>
                  )}
                </div>
              </section>

              {/* Delete Card */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    deleteCard(active.id);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[11px] font-bold hover:bg-red-100 dark:hover:bg-red-950/40 transition-colors"
                >
                  <Trash2 size={13} />
                  {t('common.delete')}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer save */}
        <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 dark:border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              if (editCard) saveCardEdit();
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sda-blue text-white text-xs font-bold hover:bg-sda-blue-dark transition-colors"
          >
            <Save size={14} />
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditField = ({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) => (
  <div>
    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-800 dark:text-slate-200 resize-none"
        rows={3}
      />
    ) : (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
      />
    )}
  </div>
);
