import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useBlueCardStore } from '@/store/useBlueCardStore';
import { Bookmark, Settings } from 'lucide-react';

interface Props {
  churchName?: string;
  isAdmin?: boolean;
  onAdminOpen?: () => void;
  compact?: boolean;
  hideDetails?: boolean;
}

export const BlueCardDisplay: React.FC<Props> = ({ churchName, isAdmin, onAdminOpen, compact, hideDetails }) => {
  const card = useBlueCardStore((s) => s.cards.find((c) => c.id === s.activeCardId));
  const missionWords = card?.missionWords ?? [];
  const [activeMotto, setActiveMotto] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveMotto((current) => (current + 1) % (missionWords.length || 1));
    }, 30000);
    return () => window.clearInterval(intervalId);
  }, [missionWords.length]);

  const displayLabel = churchName ?? card?.congregationLabel ?? 'Kigali Central Congregation';

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-sda-blue via-sda-blue to-sda-blue-dark text-white rounded-2xl shadow-xl shadow-sda-blue/20 ring-1 ring-white/10 ${compact ? 'p-4' : 'pt-10 px-6 pb-7'}`}>
      <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-sda-gold/70 to-transparent" />
      <div className="absolute right-0 bottom-0 opacity-10 transform translate-y-1/4 translate-x-1/4">
        <Bookmark size={compact ? 160 : 260} />
      </div>

      {isAdmin && onAdminOpen && (
        <button
          type="button"
          onClick={onAdminOpen}
          className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm transition-colors text-white/80 hover:text-white"
          title="Manage Blue Card"
        >
          <Settings size={16} />
        </button>
      )}

      <div className={`relative z-10 ${compact && !hideDetails ? '' : 'grid gap-4 md:grid-cols-2 md:items-center'}`}>
        {!hideDetails && (
          <div className={compact ? 'mb-3' : 'max-w-lg'}>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-sda-gold/20 text-sda-gold-light px-2.5 py-1 rounded-full">
              {displayLabel}
            </span>
            <h2 className={`font-extrabold mt-2 tracking-tight ${compact ? 'text-base' : 'text-2xl'}`}>
              {card?.mainTitle ?? 'Active Sabbath Fellowship'}
            </h2>
            <p className={`text-white/80 mt-1 leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {card?.welcomeMessage ?? 'Welcome to your member portal.'}
            </p>
          </div>
        )}

        <div className="flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between">
            {!hideDetails && (
              <span className="rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.22em] text-sda-gold-light">
                {card?.missionWordsLabel ?? 'MIFEM MOTO'}
              </span>
            )}
            {missionWords.length > 1 && (
              <div className="flex gap-1.5">
                {missionWords.map((motto, index) => (
                  <button
                    key={motto.id}
                    type="button"
                    onClick={() => setActiveMotto(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeMotto ? 'w-8 bg-sda-gold-light' : 'w-2.5 bg-white/35 hover:bg-white/55'
                    }`}
                    aria-label={motto.title}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={`relative ${compact ? 'min-h-[80px]' : 'min-h-[190px]'}`}>
            <AnimatePresence mode="wait">
              {missionWords.length > 0 ? (
                <motion.div
                  key={missionWords[activeMotto % missionWords.length].id}
                  initial={{ opacity: 0, x: 42 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -26 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col justify-center"
                >
                  <p className="text-sm font-black uppercase tracking-[0.14em] text-sda-gold-light">
                    {missionWords[activeMotto % missionWords.length].title}
                  </p>
                  <p className={`mt-2 font-semibold leading-6 text-white/92 ${compact ? 'text-xs' : 'text-base'}`}>
                    {missionWords[activeMotto % missionWords.length].body}
                  </p>
                </motion.div>
              ) : (
                <div className="flex flex-col justify-center">
                  <p className="text-xs italic text-white/50">No mission words yet. Admin can add them.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
