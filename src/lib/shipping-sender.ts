export interface ShippingSenderInfo {
  storeName: string;
  address: string;
  customerId: string;
  accountInfo: string;
  phone: string;
}

export const DEFAULT_SHIPPING_SENDER_INFO: ShippingSenderInfo = {
  storeName: 'ZARISH',
  address: 'Convent Junction, EKM, 682011',
  customerId: '1511058312',
  accountInfo: 'NHS KOCHI - BNPL A/C 158',
  phone: '9562292980',
};

const LOCAL_STORAGE_KEY = 'zarish_shipping_sender_info_v1';

export function saveShippingSenderLocally(info: ShippingSenderInfo): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(info));
  } catch (err) {
    console.warn('Could not cache shipping sender locally:', err);
  }
}

export function getLocalShippingSender(): ShippingSenderInfo {
  if (typeof window === 'undefined') return DEFAULT_SHIPPING_SENDER_INFO;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.storeName || parsed?.address) {
        return {
          storeName: parsed.storeName || DEFAULT_SHIPPING_SENDER_INFO.storeName,
          address: parsed.address || DEFAULT_SHIPPING_SENDER_INFO.address,
          customerId: parsed.customerId || DEFAULT_SHIPPING_SENDER_INFO.customerId,
          accountInfo: parsed.accountInfo || DEFAULT_SHIPPING_SENDER_INFO.accountInfo,
          phone: parsed.phone || DEFAULT_SHIPPING_SENDER_INFO.phone,
        };
      }
    }
  } catch {
    // fallback
  }
  return DEFAULT_SHIPPING_SENDER_INFO;
}
