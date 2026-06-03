import { useCallback } from 'react';
import { useNotificationStore } from '@/store/useNotificationStore';

export function useAudioChime() {
  const soundEnabled = useNotificationStore((state) => state.soundEnabled);

  const playChime = useCallback(() => {
    if (!soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      
      // Tone 1: High crisp E5
      const osc1 = audioCtx.createOscillator();
      const gainNode1 = audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
      gainNode1.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gainNode1.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.0);
      
      // Tone 2: Warm supporting B5
      const osc2 = audioCtx.createOscillator();
      const gainNode2 = audioCtx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(987.77, audioCtx.currentTime); // B5
      gainNode2.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.6);

      osc1.connect(gainNode1);
      gainNode1.connect(audioCtx.destination);

      osc2.connect(gainNode2);
      gainNode2.connect(audioCtx.destination);

      osc1.start();
      osc2.start();

      osc1.stop(audioCtx.currentTime + 1.1);
      osc2.stop(audioCtx.currentTime + 1.1);
    } catch (error) {
      console.warn('Dynamic audio synthesis chime block by browser auto-play policy or lack of support:', error);
    }
  }, [soundEnabled]);

  return { playChime };
}
