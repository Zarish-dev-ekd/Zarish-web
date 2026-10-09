'use client';

import { useState, useEffect } from 'react';

export interface StockBadgeConfig {
  enable_low_stock_badge: boolean;
  low_stock_threshold: number;
  show_in_stock_badge: boolean;
}

export const DEFAULT_STOCK_BADGE_CONFIG: StockBadgeConfig = {
  enable_low_stock_badge: true,
  low_stock_threshold: 3,
  show_in_stock_badge: false,
};

const LOCAL_STORAGE_KEY = 'zarish_stock_badge_config_v1';
const UPDATE_EVENT_NAME = 'zarish_stock_badge_updated';

let cachedConfig: StockBadgeConfig | null = null;
let activeFetchPromise: Promise<StockBadgeConfig> | null = null;

export function getLocalStockBadgeConfig(): StockBadgeConfig {
  if (cachedConfig) return cachedConfig;
  if (typeof window === 'undefined') return DEFAULT_STOCK_BADGE_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      cachedConfig = {
        enable_low_stock_badge: typeof parsed.enable_low_stock_badge === 'boolean' ? parsed.enable_low_stock_badge : true,
        low_stock_threshold: Number(parsed.low_stock_threshold) || 3,
        show_in_stock_badge: typeof parsed.show_in_stock_badge === 'boolean' ? parsed.show_in_stock_badge : false,
      };
      return cachedConfig;
    }
  } catch {
    // Ignore
  }
  return DEFAULT_STOCK_BADGE_CONFIG;
}

export function saveLocalStockBadgeConfig(config: StockBadgeConfig) {
  cachedConfig = config;
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: config }));
  } catch {
    // Ignore
  }
}

export function fetchStockBadgeConfig(): Promise<StockBadgeConfig> {
  if (activeFetchPromise) return activeFetchPromise;

  activeFetchPromise = fetch('/api/stock-badge-settings')
    .then((res) => res.json())
    .then((data) => {
      if (data?.config) {
        saveLocalStockBadgeConfig(data.config);
        return data.config as StockBadgeConfig;
      }
      return getLocalStockBadgeConfig();
    })
    .catch(() => getLocalStockBadgeConfig())
    .finally(() => {
      activeFetchPromise = null;
    });

  return activeFetchPromise;
}

export function useStockBadgeConfig(): StockBadgeConfig {
  // Start with default config for SSR to avoid hydration mismatch
  const [config, setConfig] = useState<StockBadgeConfig>(DEFAULT_STOCK_BADGE_CONFIG);

  useEffect(() => {
    // Sync with local cache after mounting
    const local = getLocalStockBadgeConfig();
    setConfig(local);

    // Fetch latest in background (shared across all components)
    fetchStockBadgeConfig().then((latest) => {
      setConfig(latest);
    });

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<StockBadgeConfig>;
      if (customEvent.detail) {
        setConfig(customEvent.detail);
      } else {
        setConfig(getLocalStockBadgeConfig());
      }
    };

    window.addEventListener(UPDATE_EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(UPDATE_EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return config;
}

