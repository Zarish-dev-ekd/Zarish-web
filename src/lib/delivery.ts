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

export function resolveDeliveryDetails(
  stateName: string,
  selectedMethodId?: string,
  config?: DeliveryConfig | null
): {
  isKerala: boolean;
  methodId: string;
  methodName: string;
  deliveryTime: string;
  deliveryFee: number;
  deliveryMethodTitle: string;
} {
  const { isKerala, options, defaultMethodId } = getDeliveryOptions(stateName, config);

  const matched = options.find((opt) => opt.id === selectedMethodId) || options[0];

  if (matched) {
    const fee = Number(matched.price) || 0;
    return {
      isKerala,
      methodId: matched.id,
      methodName: matched.name,
      deliveryTime: matched.deliveryTime,
      deliveryFee: fee,
      deliveryMethodTitle: `${matched.name} (${matched.deliveryTime})`,
    };
  }

  // Fallback defaults
  if (isKerala) {
    return {
      isKerala: true,
      methodId: 'india_post_parcel',
      methodName: 'India Post Parcel',
      deliveryTime: '3-5 Days',
      deliveryFee: 0,
      deliveryMethodTitle: 'India Post Parcel (3-5 Days)',
    };
  }

  return {
    isKerala: false,
    methodId: 'ems_speed_post',
    methodName: 'EMS Speed Post',
    deliveryTime: '2-5 Days',
    deliveryFee: 50,
    deliveryMethodTitle: 'EMS Speed Post (2-5 Days)',
  };
}
