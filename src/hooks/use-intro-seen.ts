'use client';

import { useState, useEffect, useCallback } from 'react';

export function useIntroSeen(key = 'zarish_intro_seen', storageType: 'session' | 'local' = 'session') {
  const [seen, setSeen] = useState(true); // Default true prevents SSR flash

  useEffect(() => {
    try {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      const hasSeen = storage.getItem(key);
      setSeen(hasSeen === 'true');
    } catch {
      // Fallback if storage unavailable
      setSeen(true);
    }
  }, [key, storageType]);

  const markSeen = useCallback(() => {
    try {
      const storage = storageType === 'session' ? sessionStorage : localStorage;
      storage.setItem(key, 'true');
    } catch {
      // ignore
    }
    setSeen(true);
  }, [key, storageType]);

  return { seen, markSeen };
}
