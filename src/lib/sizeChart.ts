import type { SizeMeasurementRow, SizeChartConfig, Product, SiteSettings } from './types';

export const DEFAULT_SIZE_CHART_ROWS: SizeMeasurementRow[] = [
  { size: 'S', bustIn: 28.0, lengthIn: 22.0, waistIn: 26.0, hipsIn: 36.0 },
  { size: 'M', bustIn: 30.0, lengthIn: 22.0, waistIn: 28.0, hipsIn: 38.0 },
  { size: 'L', bustIn: 32.0, lengthIn: 22.0, waistIn: 30.0, hipsIn: 40.0 },
  { size: 'XL', bustIn: 34.0, lengthIn: 23.0, waistIn: 32.0, hipsIn: 42.0 },
  { size: 'XXL', bustIn: 36.0, lengthIn: 23.0, waistIn: 34.0, hipsIn: 44.0 },
  { size: '3XL', bustIn: 38.0, lengthIn: 23.0, waistIn: 36.0, hipsIn: 46.0 },
];

const LOCAL_STORAGE_DEFAULT_KEY = 'zarish_default_size_chart';

/**
 * Resolves the global default size chart from SiteSettings, LocalStorage, or Fallback constants.
 */
export function getDefaultSizeChartRows(settings?: SiteSettings | null): SizeMeasurementRow[] {
  if (settings?.default_size_chart && Array.isArray(settings.default_size_chart) && settings.default_size_chart.length > 0) {
    return settings.default_size_chart;
  }

  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_DEFAULT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  return DEFAULT_SIZE_CHART_ROWS;
}

/**
 * Saves default size chart to local storage cache for instant reactive client UI
 */
export function saveDefaultSizeChartLocally(rows: SizeMeasurementRow[]) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_DEFAULT_KEY, JSON.stringify(rows));
    } catch {
      // Ignore localStorage errors
    }
  }
}

/**
 * Resolves the effective size chart rows for a given product.
 * Returns null if size chart is explicitly disabled for this product.
 */
export function getEffectiveProductSizeChart(
  product?: Product | null,
  globalDefaultRows: SizeMeasurementRow[] = DEFAULT_SIZE_CHART_ROWS
): { isActive: boolean; rows: SizeMeasurementRow[]; isCustom: boolean } {
  if (!product) {
    return { isActive: true, rows: globalDefaultRows, isCustom: false };
  }

  const config = product.size_chart;

  // If size chart explicitly disabled for this product
  if (config && config.is_active === false) {
    return { isActive: false, rows: [], isCustom: false };
  }

  // If product has custom size chart rows specified
  if (config && config.use_default === false && Array.isArray(config.rows) && config.rows.length > 0) {
    return { isActive: true, rows: config.rows, isCustom: true };
  }

  // Fallback to global default
  return { isActive: true, rows: globalDefaultRows, isCustom: false };
}
