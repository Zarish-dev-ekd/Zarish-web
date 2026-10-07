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

export function getLocalStockBadgeConfig(): StockBadgeConfig {
  if (typeof window === 'undefined') return DEFAULT_STOCK_BADGE_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        enable_low_stock_badge: typeof parsed.enable_low_stock_badge === 'boolean' ? parsed.enable_low_stock_badge : true,
        low_stock_threshold: Number(parsed.low_stock_threshold) || 3,
        show_in_stock_badge: typeof parsed.show_in_stock_badge === 'boolean' ? parsed.show_in_stock_badge : false,
      };
    }
  } catch {
    // Ignore
  }
  return DEFAULT_STOCK_BADGE_CONFIG;
}

export function saveLocalStockBadgeConfig(config: StockBadgeConfig) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT_NAME, { detail: config }));
  } catch {
    // Ignore
  }
}

export function useStockBadgeConfig(): StockBadgeConfig {
  const [config, setConfig] = useState<StockBadgeConfig>(() => getLocalStockBadgeConfig());

  useEffect(() => {
    // Fetch latest from API
    fetch('/api/stock-badge-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.config) {
          setConfig(data.config);
          saveLocalStockBadgeConfig(data.config);
        }
      })
      .catch(() => {});

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
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
