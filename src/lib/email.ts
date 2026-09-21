import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zarish-web.vercel.app';
const WHATSAPP_NUMBER = '919562292945';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

interface SendWelcomeEmailParams {
  to: string;
  name?: string | null;
  provider?: 'google' | 'email';
}

/**
 * Send a luxury minimalist welcome email using Brevo (Sendinblue) Transactional Email API v3.
 * Aesthetic: Nike / Zara / Net-A-Porter level typography with direct CTA.
 */
export async function sendWelcomeEmail({
  to,
  name,
  provider = 'email',
}: SendWelcomeEmailParams): Promise<{ success: boolean; error?: string }> {
  const rawApiKey = process.env.BREVO_API_KEY || '';
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || '';
  const rawSenderName = process.env.BREVO_SENDER_NAME || 'ZARISH';

  const apiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();
  const senderEmail = rawSenderEmail.replace(/^["']|["']$/g, '').trim();
  const senderName = rawSenderName.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || !senderEmail) {
    console.warn('[Email Service - Brevo] Brevo not configured. Skipped welcome email.');
    return { success: false, error: 'Brevo not configured' };
  }

  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-zarish.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  } catch (err) {
    console.warn('[Email Service] Could not read logo file:', err);
  }

  const subject = 'Welcome to ZARISH';
  const customerFirstName = name ? name.split(' ')[0] : 'there';

  const plainText = `Welcome to ZARISH, ${customerFirstName}.

Your account has been created. Discover graceful, thoughtfully tailored modest silhouettes crafted for everyday confidence and unforgettable moments.

Explore the collection: ${SITE_URL}/products

ZARISH by Nehala Mufeed
Made for moments worth remembering.`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F6F3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #EAE4DD; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 29, 19, 0.04);">
          
          <!-- Brand Logo Header -->
          <tr>
            <td align="center" style="padding: 36px 24px 24px 24px; border-bottom: 1px solid #F3EDE7;">
              <img src="cid:logo-zarish.png" alt="ZARISH" width="150" style="display: block; margin: 0 auto; max-height: 38px; width: 150px;" />
            </td>
          </tr>

          <!-- Main Hero Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #7B5B3A;">
                Welcome to ZARISH
              </p>
              
              <h1 style="margin: 0 0 14px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.01em; color: #111111; line-height: 1.25;">
                Timeless Modest Elegance.
              </h1>

              <p style="margin: 0 auto 28px auto; max-width: 420px; font-size: 14px; color: #6B5E55; line-height: 1.65;">
                Hello <strong>${customerFirstName}</strong>, your account is active. Explore thoughtfully tailored silhouettes designed for your sacred moments and everyday confidence.
              </p>

              <!-- Primary Action Button -->
              <div>
                <a
                  href="${SITE_URL}/products"
                  target="_blank"
                  style="display: inline-block; background-color: #111111; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 15px 36px; border-radius: 50px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);"
                >
                  Explore Collection &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Value Pillars -->
          <tr>
            <td style="padding: 0 36px 32px 36px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF8F5; border-radius: 14px; border: 1px solid #EFE8E1; padding: 16px 20px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #3D2B1F;">
                    <strong style="color: #111111;">&bull; Complimentary Shipping:</strong> On all orders over ₹2,999
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #3D2B1F;">
                    <strong style="color: #111111;">&bull; Artisan Craftsmanship:</strong> Premium fabrics &amp; relaxed fits
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; color: #3D2B1F;">
                    <strong style="color: #111111;">&bull; Personal Styling:</strong> Direct concierge assistance via WhatsApp
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 36px; background-color: #FAF8F5; border-top: 1px solid #EFE8E1; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #7B5B3A; letter-spacing: 0.1em; text-transform: uppercase;">
                Made for moments worth remembering.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9C8F84;">
                &copy; ${new Date().getFullYear()} ZARISH by Nehala Mufeed. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const requestBody: any = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to, name: name || to.split('@')[0] }],
    subject,
    htmlContent: html,
    textContent: plainText,
  };

  if (logoBase64) {
    requestBody.attachment = [
      {
        name: 'logo-zarish.png',
        content: logoBase64,
      },
    ];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    return { success: response.ok };
  } catch (error: any) {
    console.error('[Brevo Email] Welcome email error:', error);
    return { success: false, error: error?.message };
  }
}

/**
 * Backward compatibility alias for Google-specific welcome email.
 */
export async function sendGoogleWelcomeEmail(
  params: SendWelcomeEmailParams
): Promise<{ success: boolean; error?: string }> {
  return sendWelcomeEmail({ ...params, provider: 'google' });
}

/**
 * Send a sleek, secure password reset email.
 */
export async function sendPasswordResetEmail({
  to,
  resetUrl,
}: {
  to: string;
  resetUrl: string;
}): Promise<{ success: boolean; error?: string }> {
  const rawApiKey = process.env.BREVO_API_KEY || '';
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || '';
  const rawSenderName = process.env.BREVO_SENDER_NAME || 'ZARISH';

  const apiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();
  const senderEmail = rawSenderEmail.replace(/^["']|["']$/g, '').trim();
  const senderName = rawSenderName.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || !senderEmail) {
    return { success: false, error: 'Brevo not configured' };
  }

  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-zarish.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  } catch (err) {
    console.warn('[Email Service] Could not read logo file:', err);
  }

  const subject = 'Reset Your ZARISH Password';
  const plainText = `Reset Your ZARISH Password

We received a request to reset your password. Click the link below to set a new password:
${resetUrl}

If you did not request this, you can safely ignore this email. Your password will remain unchanged.

ZARISH by Nehala Mufeed`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F6F3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #EAE4DD; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 29, 19, 0.04);">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 36px 24px 24px 24px; border-bottom: 1px solid #F3EDE7;">
              <img src="cid:logo-zarish.png" alt="ZARISH" width="150" style="display: block; margin: 0 auto; max-height: 38px; width: 150px;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 36px 28px 36px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #7B5B3A;">
                Account Security
              </p>

              <h1 style="margin: 0 0 14px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.01em; color: #111111;">
                Reset Your Password
              </h1>

              <p style="margin: 0 auto 28px auto; max-width: 420px; font-size: 14px; color: #6B5E55; line-height: 1.65;">
                We received a request to update the password for <strong>${to}</strong>. Click the button below to choose a secure new password.
              </p>

              <div>
                <a
                  href="${resetUrl}"
                  target="_blank"
                  style="display: inline-block; background-color: #111111; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 15px 36px; border-radius: 50px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);"
                >
                  Reset Password &rarr;
                </a>
              </div>

              <p style="margin: 28px 0 0 0; font-size: 11px; color: #9C8F84; line-height: 1.6;">
                If you did not make this request, you can safely ignore this email. Your password will not change.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background-color: #FAF8F5; border-top: 1px solid #EFE8E1; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #9C8F84;">
                &copy; ${new Date().getFullYear()} ZARISH by Nehala Mufeed. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const requestBody: any = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: to }],
    subject,
    htmlContent: html,
    textContent: plainText,
  };

  if (logoBase64) {
    requestBody.attachment = [
      {
        name: 'logo-zarish.png',
        content: logoBase64,
      },
    ];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    return { success: response.ok };
  } catch (error: any) {
    console.error('[Brevo Email] Reset password error:', error);
    return { success: false, error: error?.message };
  }
}

export interface OrderEmailItem {
  name: string;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface SendOrderEmailParams {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  shippingAddress: {
    addressLine1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    phone?: string;
  };
  items: OrderEmailItem[];
  subtotal: number;
  discountAmount?: number;
  totalAmount: number;
  paymentMethod: string;
  notes?: string | null;
}

/**
 * Send Customer Order Confirmation Email
 * Aesthetic: Nike / Zara / Net-A-Porter high-fashion digital receipt.
 */
export async function sendOrderConfirmationEmail(
  params: SendOrderEmailParams
): Promise<{ success: boolean; error?: string }> {
  const rawApiKey = process.env.BREVO_API_KEY || '';
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || '';
  const rawSenderName = process.env.BREVO_SENDER_NAME || 'ZARISH';

  const apiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();
  const senderEmail = rawSenderEmail.replace(/^["']|["']$/g, '').trim();
  const senderName = rawSenderName.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || !senderEmail) {
    return { success: false, error: 'Brevo not configured' };
  }

  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-zarish.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  } catch (err) {
    console.warn('[Email Service] Could not read logo file:', err);
  }

  const subject = `Order Confirmed: #${params.orderNumber} | ZARISH`;
  const trackingUrl = `${SITE_URL}/track-order?orderNumber=${encodeURIComponent(params.orderNumber)}`;

  // High-End Items Table with crisp product photos
  const itemsHtml = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #F0ECE6; vertical-align: top; width: 68px;">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.name}" width="64" height="82" style="display: block; width: 64px; height: 82px; object-fit: cover; border-radius: 8px; border: 1px solid #EADBCE; background-color: #FAF6F0;" />`
              : `<div style="width: 64px; height: 82px; border-radius: 8px; background-color: #FAF6F0; border: 1px solid #EADBCE; text-align: center; line-height: 82px; font-size: 10px; color: #8C7B6B; font-weight: 600;">ZARISH</div>`
          }
        </td>
        <td style="padding: 16px 12px 16px 16px; border-bottom: 1px solid #F0ECE6; vertical-align: top;">
          <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111111; line-height: 1.35;">
            ${item.name}
          </p>
          <p style="margin: 0; font-size: 12px; color: #71717A; line-height: 1.5;">
            ${item.size ? `Size: <strong>${item.size}</strong>` : 'Standard'}
            ${item.color ? ` &bull; Color: ${item.color}` : ''}
          </p>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #8C7B6B; font-weight: 500;">
            Qty: ${item.quantity}
          </p>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #F0ECE6; vertical-align: top; text-align: right; font-size: 14px; font-weight: 700; color: #111111; white-space: nowrap;">
          ₹${Number(item.totalPrice).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F6F3; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #EAE4DD; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 29, 19, 0.04);">
          
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding: 32px 24px 20px 24px; border-bottom: 1px solid #F3EDE7;">
              <img src="cid:logo-zarish.png" alt="ZARISH" width="150" style="display: block; margin: 0 auto; max-height: 38px; width: 150px;" />
            </td>
          </tr>

          <!-- Confirmation Banner -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #7B5B3A;">
                Order Confirmed &bull; #${params.orderNumber}
              </p>

              <h1 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 700; letter-spacing: -0.02em; color: #111111;">
                Your Order Is In.
              </h1>

              <p style="margin: 0 auto 24px auto; max-width: 440px; font-size: 13.5px; color: #6B5E55; line-height: 1.6;">
                Thank you, <strong>${params.customerName}</strong>. Your modest garment is being prepared with utmost care by our master artisans.
              </p>

              <!-- View & Track Order Button (Nike / Zara style) -->
              <div>
                <a
                  href="${trackingUrl}"
                  target="_blank"
                  style="display: inline-block; background-color: #111111; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 36px; border-radius: 50px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);"
                >
                  View &amp; Track Order &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Items Table -->
          <tr>
            <td style="padding: 0 32px 20px 32px;">
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #F0ECE6;">
                ${itemsHtml}
              </table>

              <!-- Pricing Summary -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
                <tr>
                  <td style="padding: 4px 0; color: #71717A; font-size: 13px;">Subtotal</td>
                  <td style="padding: 4px 0; text-align: right; color: #111111; font-size: 13px; font-weight: 500;">
                    ₹${Number(params.subtotal).toLocaleString('en-IN')}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #71717A; font-size: 13px;">Shipping</td>
                  <td style="padding: 4px 0; text-align: right; color: #0E7064; font-size: 13px; font-weight: 600;">
                    ${params.shippingAddress.state?.toLowerCase() === 'kerala' ? 'COMPLIMENTARY' : '₹50'}
                  </td>
                </tr>
                ${
                  params.discountAmount && params.discountAmount > 0
                    ? `<tr>
                        <td style="padding: 4px 0; color: #047857; font-size: 13px;">Discount</td>
                        <td style="padding: 4px 0; text-align: right; color: #047857; font-size: 13px; font-weight: 600;">
                          -₹${Number(params.discountAmount).toLocaleString('en-IN')}
                        </td>
                      </tr>`
                    : ''
                }
                <tr>
                  <td style="padding: 14px 0 4px 0; border-top: 1px solid #F0ECE6; font-size: 15px; font-weight: 700; color: #111111;">
                    Total
                  </td>
                  <td style="padding: 14px 0 4px 0; border-top: 1px solid #F0ECE6; text-align: right; font-size: 18px; font-weight: 700; color: #111111;">
                    ₹${Number(params.totalAmount).toLocaleString('en-IN')}
                  </td>
                </tr>
              </table>

              <!-- Delivery & Payment Information Box (2 Columns) -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px; background-color: #FAF8F5; border-radius: 12px; border: 1px solid #EFE8E1; padding: 18px;">
                <tr>
                  <td style="vertical-align: top; width: 50%; padding-right: 12px;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #7B5B3A; text-transform: uppercase; letter-spacing: 0.08em;">
                      Shipping Address
                    </p>
                    <p style="margin: 0; font-size: 12.5px; color: #3D2B1F; line-height: 1.55;">
                      <strong>${params.customerName}</strong><br>
                      ${params.shippingAddress.addressLine1 || ''}<br>
                      ${params.shippingAddress.city || ''}, ${params.shippingAddress.state || ''} ${params.shippingAddress.postalCode || ''}<br>
                      ${params.customerPhone || params.shippingAddress.phone ? `📞 ${params.customerPhone || params.shippingAddress.phone}` : ''}
                    </p>
                  </td>
                  <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #EADBCE;">
                    <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; color: #7B5B3A; text-transform: uppercase; letter-spacing: 0.08em;">
                      Payment Details
                    </p>
                    <p style="margin: 0; font-size: 12.5px; color: #3D2B1F; line-height: 1.55;">
                      Status: <strong style="color: #0E7064;">Paid (Verified)</strong><br>
                      Method: Razorpay Online<br>
                      Currency: INR (₹)
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Concierge Styling Strip -->
              <div style="text-align: center; margin-top: 24px; padding-top: 18px; border-top: 1px solid #F0ECE6;">
                <p style="margin: 0 0 10px 0; font-size: 12px; color: #71717A;">
                  Questions or custom styling advice?
                </p>
                <a
                  href="${WHATSAPP_URL}"
                  target="_blank"
                  style="display: inline-block; background-color: #FAF6F0; color: #2C1D13; text-decoration: none; font-size: 11.5px; font-weight: 600; padding: 8px 20px; border-radius: 50px; border: 1px solid #E2D5C7;"
                >
                  Chat with Concierge on WhatsApp &rarr;
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #FAF8F5; border-top: 1px solid #EFE8E1; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 600; color: #7B5B3A; letter-spacing: 0.1em; text-transform: uppercase;">
                Made for moments worth remembering.
              </p>
              <p style="margin: 0; font-size: 11px; color: #9C8F84;">
                &copy; ${new Date().getFullYear()} ZARISH by Nehala Mufeed. Kerala, India.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const requestBody: any = {
    sender: { name: senderName, email: senderEmail },
    to: [{ email: params.customerEmail, name: params.customerName }],
    subject,
    htmlContent: html,
  };

  if (logoBase64) {
    requestBody.attachment = [
      {
        name: 'logo-zarish.png',
        content: logoBase64,
      },
    ];
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    return { success: response.ok };
  } catch (error: any) {
    console.error('[Brevo Email] Customer confirmation error:', error);
    return { success: false, error: error?.message };
  }
}

/**
 * Send New Order Notification to the Admin.
 * Aesthetic: Clean executive order alert.
 */
export async function sendAdminNewOrderEmail(
  params: SendOrderEmailParams
): Promise<{ success: boolean; error?: string }> {
  const rawApiKey = process.env.BREVO_API_KEY || '';
  const rawSenderEmail = process.env.BREVO_SENDER_EMAIL || '';
  const rawSenderName = process.env.BREVO_SENDER_NAME || 'ZARISH Orders';

  const apiKey = rawApiKey.replace(/^["']|["']$/g, '').trim();
  const senderEmail = rawSenderEmail.replace(/^["']|["']$/g, '').trim();
  const senderName = rawSenderName.replace(/^["']|["']$/g, '').trim();

  if (!apiKey || !senderEmail) return { success: false, error: 'Brevo not configured' };

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || senderEmail;
  const subject = `[NEW ORDER] #${params.orderNumber} - ₹${Number(params.totalAmount).toLocaleString('en-IN')} by ${params.customerName}`;
  const adminOrdersUrl = `${SITE_URL}/admin/orders`;

  const itemsRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #EFE8E1; vertical-align: middle; width: 44px;">
          ${
            item.imageUrl
              ? `<img src="${item.imageUrl}" alt="${item.name}" width="40" height="50" style="display: block; width: 40px; height: 50px; object-fit: cover; border-radius: 6px; border: 1px solid #EADBCE;" />`
              : `<div style="width: 40px; height: 50px; border-radius: 6px; background-color: #FAF6F0; border: 1px solid #EADBCE; text-align: center; line-height: 50px; font-size: 9px; color: #8C7B6B;">IMG</div>`
          }
        </td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #EFE8E1; vertical-align: middle; font-size: 13px; color: #111111;">
          <div style="font-weight: 600; color: #111111;">${item.name}</div>
          <div style="font-size: 11.5px; color: #71717A;">Size: ${item.size || 'Standard'} &bull; Qty: ${item.quantity}</div>
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #EFE8E1; vertical-align: middle; text-align: right; font-size: 13px; font-weight: 700; color: #111111; white-space: nowrap;">
          ₹${Number(item.totalPrice).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8F6F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111111;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8F6F3; padding: 36px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #EAE4DD; overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #2C1D13; color: #FFFFFF;">
              <span style="font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #C8A97E;">
                Store Management Alert
              </span>
              <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #FFFFFF;">
                New Order Received: #${params.orderNumber}
              </h1>
            </td>
          </tr>

          <!-- Summary Box -->
          <tr>
            <td style="padding: 28px 32px;">
              <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 10px; padding: 14px 18px; margin-bottom: 24px;">
                <span style="font-size: 12px; color: #15803D; font-weight: 600;">Payment Captured:</span>
                <span style="font-size: 18px; font-weight: 700; color: #15803D; margin-left: 6px;">
                  ₹${Number(params.totalAmount).toLocaleString('en-IN')}
                </span>
                <span style="font-size: 11px; color: #15803D; margin-left: 6px;">(Razorpay Online)</span>
              </div>

              <!-- Customer & Delivery Table -->
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px; font-size: 13px; line-height: 1.6;">
                <tr>
                  <td style="width: 35%; color: #71717A; padding: 4px 0;">Customer Name:</td>
                  <td style="color: #111111; font-weight: 600; padding: 4px 0;">${params.customerName}</td>
                </tr>
                <tr>
                  <td style="color: #71717A; padding: 4px 0;">Customer Email:</td>
                  <td style="color: #111111; padding: 4px 0;">${params.customerEmail}</td>
                </tr>
                <tr>
                  <td style="color: #71717A; padding: 4px 0;">Phone:</td>
                  <td style="color: #111111; font-weight: 600; padding: 4px 0;">
                    ${params.customerPhone || params.shippingAddress.phone || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td style="color: #71717A; padding: 4px 0; vertical-align: top;">Shipping Address:</td>
                  <td style="color: #111111; padding: 4px 0;">
                    ${params.shippingAddress.addressLine1 || ''}<br>
                    ${params.shippingAddress.city || ''}, ${params.shippingAddress.state || ''} ${params.shippingAddress.postalCode || ''}
                  </td>
                </tr>
              </table>

              <!-- Ordered Items -->
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #7B5B3A; letter-spacing: 0.08em;">
                Garments Ordered
              </p>
              <table width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top: 1px solid #EFE8E1; margin-bottom: 24px;">
                ${itemsRows}
              </table>

              <!-- Button to Admin Orders -->
              <div style="text-align: center; margin-top: 24px;">
                <a
                  href="${adminOrdersUrl}"
                  target="_blank"
                  style="display: inline-block; background-color: #2C1D13; color: #FFFFFF; text-decoration: none; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 13px 30px; border-radius: 50px;"
                >
                  Manage Order in Admin Portal &rarr;
                </a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: adminEmail }],
        subject,
        htmlContent: html,
      }),
    });

    return { success: response.ok };
  } catch (error: any) {
    console.error('[Brevo Email] Error notifying admin of new order:', error);
    return { success: false, error: error?.message };
  }
}
