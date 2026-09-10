import crypto from 'crypto';

export interface RazorpayOrderOptions {
  amountInPaise: number; // e.g. ₹2,999 => 299900 paise
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResult {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  isSimulated?: boolean;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(keyId && keySecret && !keyId.includes('your_') && !keySecret.includes('your_'));
}

export function getRazorpayKeyId(): string {
  return (
    process.env.RAZORPAY_KEY_ID ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
    'rzp_test_placeholder'
  );
}

/**
 * Creates an authoritative order on Razorpay servers
 */
export async function createRazorpayOrder({
  amountInPaise,
  currency = 'INR',
  receipt,
  notes = {},
}: RazorpayOrderOptions): Promise<RazorpayOrderResult> {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (isRazorpayConfigured() && keyId && keySecret) {
    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify({
        amount: Math.round(amountInPaise),
        currency,
        receipt,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay API error:', data);
      throw new Error(data.error?.description || 'Failed to create order on Razorpay');
    }

    return {
      id: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      status: data.status,
      isSimulated: false,
    };
  }

  // Fallback: Simulation mode for local development before keys are configured
  console.info(
    'ℹ️ [Razorpay Setup Mode] Real keys not detected. Operating in simulated payment mode.'
  );
  return {
    id: `order_sim_${Date.now()}`,
    amount: Math.round(amountInPaise),
    currency,
    receipt,
    status: 'created',
    isSimulated: true,
  };
}

/**
 * Validates HMAC SHA256 signature returned by Razorpay Checkout
 */
export function verifyRazorpaySignature({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  // If simulated order in development mode
  if (razorpay_order_id.startsWith('order_sim_')) {
    return true;
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.warn('Cannot verify Razorpay signature: RAZORPAY_KEY_SECRET is not set.');
    return false;
  }

  try {
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (err) {
    console.error('Signature verification failed:', err);
    return false;
  }
}
