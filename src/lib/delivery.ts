export type DeliveryMethodId = 'india_post_parcel' | 'ems_speed_post' | 'dtdc';

export interface DeliveryOption {
  id: DeliveryMethodId;
  name: string;
  deliveryTime: string;
  price: number;
  priceLabel: string;
  badge?: string;
  isBlinkingFree?: boolean;
}

export const KERALA_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'india_post_parcel',
    name: 'India Post Parcel',
    deliveryTime: '3–5 Days',
    price: 0,
    priceLabel: 'FREE',
    badge: 'FREE SHIPPING',
    isBlinkingFree: true,
  },
  {
    id: 'ems_speed_post',
    name: 'EMS Speed Post',
    deliveryTime: '1–3 Days',
    price: 50,
    priceLabel: '+₹50',
  },
  {
    id: 'dtdc',
    name: 'DTDC Express',
    deliveryTime: '1–2 Days',
    price: 50,
    priceLabel: '+₹50',
  },
];

export const OTHER_STATE_DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'ems_speed_post',
    name: 'EMS Speed Post',
    deliveryTime: '2–5 Days',
    price: 50,
    priceLabel: '+₹50',
  },
];

export function getDeliveryOptions(stateName: string): {
  isKerala: boolean;
  options: DeliveryOption[];
  defaultMethodId: DeliveryMethodId;
} {
  const isKerala = stateName?.trim().toLowerCase() === 'kerala';
  if (isKerala) {
    return {
      isKerala: true,
      options: KERALA_DELIVERY_OPTIONS,
      defaultMethodId: 'india_post_parcel',
    };
  }
  return {
    isKerala: false,
    options: OTHER_STATE_DELIVERY_OPTIONS,
    defaultMethodId: 'ems_speed_post',
  };
}

export function resolveDeliveryDetails(stateName: string, selectedMethodId?: string): {
  isKerala: boolean;
  methodId: DeliveryMethodId;
  methodName: string;
  deliveryTime: string;
  deliveryFee: number;
  deliveryMethodTitle: string;
} {
  const isKerala = stateName?.trim().toLowerCase() === 'kerala';
  if (isKerala) {
    if (selectedMethodId === 'dtdc') {
      return {
        isKerala: true,
        methodId: 'dtdc',
        methodName: 'DTDC Express',
        deliveryTime: '1–2 Days',
        deliveryFee: 50,
        deliveryMethodTitle: 'DTDC Express (1-2 Days)',
      };
    }
    if (selectedMethodId === 'ems_speed_post') {
      return {
        isKerala: true,
        methodId: 'ems_speed_post',
        methodName: 'EMS Speed Post',
        deliveryTime: '1–3 Days',
        deliveryFee: 50,
        deliveryMethodTitle: 'EMS Speed Post (1-3 Days)',
      };
    }
    return {
      isKerala: true,
      methodId: 'india_post_parcel',
      methodName: 'India Post Parcel',
      deliveryTime: '3–5 Days',
      deliveryFee: 0,
      deliveryMethodTitle: 'India Post Parcel (3-5 Days)',
    };
  }

  return {
    isKerala: false,
    methodId: 'ems_speed_post',
    methodName: 'EMS Speed Post',
    deliveryTime: '2–5 Days',
    deliveryFee: 50,
    deliveryMethodTitle: 'EMS Speed Post (2-5 Days)',
  };
}
