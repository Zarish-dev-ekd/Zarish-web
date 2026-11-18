export type DeliveryMethodId = 'india_post_parcel' | 'ems_speed_post' | 'dtdc' | string;

export interface DeliveryOption {
  id: string;
  name: string;
  deliveryTime: string;
  price: number;
  priceLabel?: string;
  badge?: string;
  isBlinkingFree?: boolean;
  isActive?: boolean;
  minDays?: number;
  maxDays?: number;
  defaultNote?: string;
}

export interface DeliveryConfig {
  kerala: DeliveryOption[];
  otherStates: DeliveryOption[];
}

export const DEFAULT_KERALA_OPTIONS: DeliveryOption[] = [
  {
    id: 'india_post_parcel',
    name: 'Standard delivery via India post',
    deliveryTime: '3-5 Days',
    price: 0,
    priceLabel: 'FREE',
    badge: 'FREE',
    isBlinkingFree: true,
    isActive: true,
    minDays: 3,
    maxDays: 5,
    defaultNote: 'Reliable doorstep delivery',
  },
  {
    id: 'dtdc',
    name: 'Express 1-2 day delivery via DTDC',
    deliveryTime: '1-2 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
    minDays: 1,
    maxDays: 2,
    defaultNote: 'Same-day shipping until 5pm IST.',
  },
  {
    id: 'ems_speed_post',
    name: 'EMS Speed post',
    deliveryTime: '1-3 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
    minDays: 1,
    maxDays: 3,
    defaultNote: 'Fast service, convenient home delivery.',
  },
];

export const DEFAULT_OTHER_STATE_OPTIONS: DeliveryOption[] = [
  {
    id: 'ems_speed_post',
    name: 'EMS Speed post (Interstate Express)',
    deliveryTime: '2-5 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
    minDays: 2,
    maxDays: 5,
    defaultNote: 'Fast service, convenient home delivery.',
  },
];

/**
 * Calculates dynamic calendar delivery dates based on current Indian Standard Time (IST).
 * Takes into account operating hours and skips Sundays for dispatch & transit.
 */
export function getEstimatedDeliveryDates(
  minDays: number,
  maxDays: number,
  referenceDate: Date = new Date()
): {
  dateRangeText: string;
  dispatchNote: string;
} {
  // Convert referenceDate to IST (UTC + 5:30)
  const utc = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const istDate = new Date(utc + 3600000 * 5.5);

  const istHour = istDate.getHours();
  const istDay = istDate.getDay(); // 0 is Sunday

  // Determine dispatch start date (skipping Sundays)
  const dispatchDate = new Date(istDate);

  let shipsToday = false;
  if (istDay !== 0 && istHour < 17) {
    shipsToday = true;
  } else {
    // Ships next business day
    dispatchDate.setDate(dispatchDate.getDate() + 1);
    if (dispatchDate.getDay() === 0) {
      // If next day is Sunday, ship on Monday
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    }
  }

  // Calculate delivery date adding working/transit days (skips Sundays)
  function addTransitDays(startDate: Date, transitDays: number): Date {
    const result = new Date(startDate);
    let added = 0;
    while (added < transitDays) {
      result.setDate(result.getDate() + 1);
      if (result.getDay() !== 0) {
        added++;
      }
    }
    return result;
  }

  const deliveryMin = addTransitDays(dispatchDate, minDays);
  const deliveryMax = addTransitDays(dispatchDate, maxDays);

  const formatDayMonth = (d: Date) => {
    const dayStr = d.toLocaleDateString('en-IN', { weekday: 'short' });
    const dateNum = d.getDate();
    const monthStr = d.toLocaleDateString('en-IN', { month: 'short' });
    return `${dayStr}, ${dateNum} ${monthStr}`;
  };

  const minStr = formatDayMonth(deliveryMin);
  const maxStr = formatDayMonth(deliveryMax);

  const dateRangeText = minStr === maxStr ? minStr : `${minStr}–${maxStr}`;

  return {
    dateRangeText,
    dispatchNote: shipsToday
      ? 'Same-day shipping until 5pm IST.'
      : 'Reliable doorstep delivery',
  };
}

export const DEFAULT_DELIVERY_CONFIG: DeliveryConfig = {
  kerala: DEFAULT_KERALA_OPTIONS,
  otherStates: DEFAULT_OTHER_STATE_OPTIONS,
};

const LOCAL_STORAGE_KEY = 'zarish_delivery_config_v1';

export function saveDeliveryConfigLocally(config: DeliveryConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Could not cache delivery config locally:', err);
  }
}

export function getLocalDeliveryConfig(): DeliveryConfig {
  if (typeof window === 'undefined') return DEFAULT_DELIVERY_CONFIG;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed?.kerala) && Array.isArray(parsed?.otherStates)) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_DELIVERY_CONFIG;
}

export function getDeliveryOptions(
  stateName: string,
  config?: DeliveryConfig | null
): {
  isKerala: boolean;
  options: DeliveryOption[];
  defaultMethodId: string;
} {
  const activeConfig = config || DEFAULT_DELIVERY_CONFIG;
  const isKerala = stateName?.trim().toLowerCase() === 'kerala';

  const rawOptions = isKerala ? activeConfig.kerala : activeConfig.otherStates;
  // Filter only active options (default to true if isActive is not set)
  const options = (rawOptions || []).filter((opt) => opt.isActive !== false);

  const finalOptions = options.length > 0 ? options : (isKerala ? DEFAULT_KERALA_OPTIONS : DEFAULT_OTHER_STATE_OPTIONS);
  const defaultMethodId = finalOptions[0]?.id || (isKerala ? 'india_post_parcel' : 'ems_speed_post');

  return {
    isKerala,
    options: finalOptions,
    defaultMethodId,
  };
}

export interface DeliveryFeeCalculation {
  fee: number;
  priceLabel: string;
  isBlinkingFree: boolean;
  rateHint?: string;
}

export function calculateDeliveryFee(
  methodId: string,
  stateName: string,
  quantity = 1,
  config?: DeliveryConfig | null
): DeliveryFeeCalculation {
  const normState = (stateName || '').trim().toLowerCase();
  const isKerala = normState === 'kerala';
  const q = Math.max(1, Math.round(Number(quantity) || 1));
  const normId = (methodId || '').toLowerCase();

  // 1. KERALA RULES
  if (isKerala) {
    // 1A. India Post Parcel: ALWAYS FREE for all quantities
    if (normId.includes('parcel') || normId.includes('india_post')) {
      return {
        fee: 0,
        priceLabel: 'FREE',
        isBlinkingFree: true,
        rateHint: 'Free delivery',
      };
    }

    // 1B. EMS Speed Post:
    // 1 pc: ₹50, 2 pcs: ₹80, 3+ pcs: ₹35 per pc (e.g. 3 pcs = ₹105, 4 pcs = ₹140)
    if (normId.includes('speed') || normId.includes('ems')) {
      if (q === 1) {
        return {
          fee: 50,
          priceLabel: '+₹50',
          isBlinkingFree: false,
          rateHint: '₹50 for 1 pc',
        };
      }
      if (q === 2) {
        return {
          fee: 80,
          priceLabel: '+₹80',
          isBlinkingFree: false,
          rateHint: '₹80 for 2 pcs',
        };
      }
      const fee = q * 35;
      return {
        fee,
        priceLabel: `+₹${fee}`,
        isBlinkingFree: false,
        rateHint: `₹35/pc (${q} pcs)`,
      };
    }

    // 1C. DTDC Express:
    // ₹50 per pc (e.g. 1 pc = ₹50, 2 pcs = ₹100, 3 pcs = ₹150)
    if (normId.includes('dtdc')) {
      const fee = q * 50;
      return {
        fee,
        priceLabel: `+₹${fee}`,
        isBlinkingFree: false,
        rateHint: q === 1 ? '₹50/pc' : `₹50/pc (${q} pcs)`,
      };
    }
  } else {
    // 2. OTHER STATES RULES (All outside Kerala)
    // 2A. EMS Speed Post:
    // 1 pc: ₹50, 2+ pcs: ₹40 per pc (e.g. 2 pcs = ₹80, 3 pcs = ₹120, 4 pcs = ₹160)
    if (normId.includes('speed') || normId.includes('ems')) {
      if (q === 1) {
        return {
          fee: 50,
          priceLabel: '+₹50',
          isBlinkingFree: false,
          rateHint: '₹50 for 1 pc',
        };
      }
      const fee = q * 40;
      return {
        fee,
        priceLabel: `+₹${fee}`,
        isBlinkingFree: false,
        rateHint: `₹40/pc (${q} pcs)`,
      };
    }

    // DTDC Express if present in other states: ₹50 per pc
    if (normId.includes('dtdc')) {
      const fee = q * 50;
      return {
        fee,
        priceLabel: `+₹${fee}`,
        isBlinkingFree: false,
        rateHint: `₹50/pc (${q} pcs)`,
      };
    }
  }

  // Fallback to configured price if available
  const { options } = getDeliveryOptions(stateName, config);
  const matched = options.find((opt) => opt.id === methodId);
  const basePrice = matched ? Number(matched.price) || 0 : 50;
  if (basePrice === 0) {
    return {
      fee: 0,
      priceLabel: 'FREE',
      isBlinkingFree: true,
      rateHint: 'Free delivery',
    };
  }

  const fee = basePrice;
  return {
    fee,
    priceLabel: `+₹${fee}`,
    isBlinkingFree: false,
  };
}

export function resolveDeliveryDetails(
  stateName: string,
  selectedMethodId?: string,
  config?: DeliveryConfig | null,
  quantity = 1
): {
  isKerala: boolean;
  methodId: string;
  methodName: string;
  deliveryTime: string;
  deliveryFee: number;
  deliveryMethodTitle: string;
  priceLabel: string;
  rateHint?: string;
  estimatedDateRange?: string;
} {
  const { isKerala, options, defaultMethodId } = getDeliveryOptions(stateName, config);

  const matched = options.find((opt) => opt.id === selectedMethodId) || options[0];
  const activeMethodId = matched?.id || defaultMethodId || (isKerala ? 'india_post_parcel' : 'ems_speed_post');
  const methodName = matched?.name || (isKerala ? 'Standard delivery via India post' : 'EMS Speed post');
  const deliveryTime = matched?.deliveryTime || (isKerala ? '3-5 Days' : '2-5 Days');

  const minDays =
    matched?.minDays ||
    (activeMethodId.includes('parcel') ? 3 : activeMethodId.includes('dtdc') ? 1 : 1);
  const maxDays =
    matched?.maxDays ||
    (activeMethodId.includes('parcel') ? 5 : activeMethodId.includes('dtdc') ? 2 : 3);
  const estimate = getEstimatedDeliveryDates(minDays, maxDays);

  const calc = calculateDeliveryFee(activeMethodId, stateName, quantity, config);

  return {
    isKerala,
    methodId: activeMethodId,
    methodName,
    deliveryTime,
    deliveryFee: calc.fee,
    deliveryMethodTitle: `${methodName} (${estimate.dateRangeText})`,
    priceLabel: calc.priceLabel,
    rateHint: calc.rateHint,
    estimatedDateRange: estimate.dateRangeText,
  };
}

