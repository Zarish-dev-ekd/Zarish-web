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
}

export interface DeliveryConfig {
  kerala: DeliveryOption[];
  otherStates: DeliveryOption[];
}

export const DEFAULT_KERALA_OPTIONS: DeliveryOption[] = [
  {
    id: 'india_post_parcel',
    name: 'India Post Parcel',
    deliveryTime: '3-5 Days',
    price: 0,
    priceLabel: 'FREE',
    badge: 'FREE',
    isBlinkingFree: true,
    isActive: true,
  },
  {
    id: 'ems_speed_post',
    name: 'EMS Speed Post',
    deliveryTime: '1-3 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
  },
  {
    id: 'dtdc',
    name: 'DTDC Express',
    deliveryTime: '1-2 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
  },
];

export const DEFAULT_OTHER_STATE_OPTIONS: DeliveryOption[] = [
  {
    id: 'ems_speed_post',
    name: 'EMS Speed Post',
    deliveryTime: '2-5 Days',
    price: 50,
    priceLabel: '+₹50',
    isActive: true,
  },
];

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
} {
  const { isKerala, options, defaultMethodId } = getDeliveryOptions(stateName, config);

  const matched = options.find((opt) => opt.id === selectedMethodId) || options[0];
  const activeMethodId = matched?.id || defaultMethodId || (isKerala ? 'india_post_parcel' : 'ems_speed_post');
  const methodName = matched?.name || (isKerala ? 'India Post Parcel' : 'EMS Speed Post');
  const deliveryTime = matched?.deliveryTime || (isKerala ? '3-5 Days' : '2-5 Days');

  const calc = calculateDeliveryFee(activeMethodId, stateName, quantity, config);

  return {
    isKerala,
    methodId: activeMethodId,
    methodName,
    deliveryTime,
    deliveryFee: calc.fee,
    deliveryMethodTitle: `${methodName} (${deliveryTime})`,
    priceLabel: calc.priceLabel,
    rateHint: calc.rateHint,
  };
}

