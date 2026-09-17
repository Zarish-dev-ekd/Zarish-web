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
}

export interface RazorpayPaymentDetails {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string; // 'captured' | 'authorized' | 'failed' | 'refunded'
  method?: string;
  email?: string;
  contact?: string;
  error_code?: string | null;
  error_description?: string | null;
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('RAZORPAY_KEY_ID is not configured in environment variables.');
  }
  return keyId;
}

export function getRazorpayKeySecret(): string {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is not configured in environment variables.');
  }
  return keySecret;
}

export function getRazorpayWebhookSecret(): string {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not configured in environment variables.');
  }
  return webhookSecret;
}

export function isRazorpayConfigured(): boolean {
  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return Boolean(
    keyId &&
    keySecret &&
    !keyId.includes('your_') &&
    !keySecret.includes('your_')
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
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

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
    console.error('Razorpay Order Creation API error:', data);
    throw new Error(data.error?.description || 'Failed to create order on Razorpay');
  }

  return {
    id: data.id,
    amount: data.amount,
    currency: data.currency,
    receipt: data.receipt,
    status: data.status,
  };
}

/**
 * Fetches payment details from Razorpay to verify status, amount, and order ID
 */
export async function fetchRazorpayPayment(paymentId: string): Promise<RazorpayPaymentDetails> {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();

  const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
    cache: 'no-store',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Razorpay Fetch Payment API error:', data);
    throw new Error(data.error?.description || 'Failed to fetch payment details from Razorpay');
  }

  return {
    id: data.id,
    order_id: data.order_id,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    method: data.method,
    email: data.email,
    contact: data.contact,
    error_code: data.error_code,
    error_description: data.error_description,
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
  try {
    const keySecret = getRazorpayKeySecret();
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(payload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(razorpay_signature, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error('Razorpay signature verification error:', err);
    return false;
  }
}

/**
 * Validates HMAC SHA256 signature from Razorpay Webhooks
 */
export function verifyRazorpayWebhookSignature({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string;
}): boolean {
  try {
    const webhookSecret = getRazorpayWebhookSecret();
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
    const providedBuffer = Buffer.from(signature, 'utf8');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error('Razorpay webhook signature verification error:', err);
    return false;
  }
}
