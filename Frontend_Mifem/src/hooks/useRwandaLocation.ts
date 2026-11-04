import { useEffect, useState } from 'react';
import type { RwandaLocation } from '@devrw/rwanda-location';

export type { RwandaLocation };

let cached: RwandaLocation | null = null;

export function useRwandaLocation(): RwandaLocation | null {
  const [rwandaLocation, setRwandaLocation] = useState<RwandaLocation | null>(cached);

  useEffect(() => {
    if (rwandaLocation) return;
    let cancelled = false;
    import('@devrw/rwanda-location')
      .then((mod) => {
        cached = mod.rwandaLocation;
        if (!cancelled) setRwandaLocation(mod.rwandaLocation);
      })
      .catch(() => {
        if (!cancelled) setRwandaLocation(null);
      });
    return () => {
      cancelled = true;
    };
  }, [rwandaLocation]);

  return rwandaLocation;
}
