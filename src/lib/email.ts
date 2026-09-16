import fs from 'fs';
import path from 'path';

interface SendWelcomeEmailParams {
  to: string;
  name?: string | null;
  provider?: 'google' | 'email';
}

/**
 * Send a welcome email to a new user using Brevo (Sendinblue) Transactional Email API v3.
 * Keeps all API keys strictly on the server.
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

  if (!apiKey) {
    console.warn(
      `[Email Service - Brevo] BREVO_API_KEY is not set in environment variables. Skipped sending welcome email to ${to}.`
    );
    return { success: false, error: 'Brevo API key not configured' };
  }

  if (!senderEmail) {
    console.warn(
      `[Email Service - Brevo] BREVO_SENDER_EMAIL is not set in environment variables. Skipped sending welcome email to ${to}.`
    );
    return { success: false, error: 'Brevo sender email not configured' };
  }

  // Load logo as base64 for inline email embedding
  let logoBase64 = '';
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo-zarish.png');
    if (fs.existsSync(logoPath)) {
      logoBase64 = fs.readFileSync(logoPath).toString('base64');
    }
  } catch (err) {
    console.warn('[Email Service] Could not read logo file:', err);
  }

  const subject = 'Welcome to Zarish';

  const signupGreeting =
    provider === 'google'
      ? 'Thank you for signing up with Google. Your account has been successfully created.'
      : 'Thank you for creating your account with Zarish. Your account has been successfully created.';

  const plainText = `Welcome to Zarish${name ? `, ${name}` : ''}!

${signupGreeting}

We're delighted to welcome you to our community. As a member, we will keep you informed about our latest collections, special promotions, and exclusive new offers so you never miss out.

We're happy to have you with us!

Enjoy your experience with Zarish.

Best regards,
Zarish Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C1D13;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF6F0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2D5C7; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 29, 19, 0.05);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 24px 22px 24px; border-bottom: 1px solid #F5EDE3; background-color: #FFFFFF;">
              <img
                src="cid:logo-zarish.png"
                alt="ZARISH by Nehala Mufeed"
                width="160"
                style="display: block; margin: 0 auto; height: auto; max-height: 40px; width: 160px; max-width: 100%; border: 0; outline: none; text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; letter-spacing: 0.18em; color: #2C1D13; text-transform: uppercase;"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; font-size: 15px; line-height: 1.7; color: #3D2B1F;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #2C1D13;">
                Welcome to Zarish${name ? `, ${name}` : ''}!
              </p>
              <p style="margin: 0 0 16px 0; color: #6B5744; line-height: 1.7;">
                ${signupGreeting}
              </p>
              <p style="margin: 0 0 16px 0; color: #6B5744; line-height: 1.7;">
                We are delighted to welcome you to our community. As a member, we will keep you informed about our latest collections, special promotions, and exclusive new offers so you never miss out.
              </p>
              <p style="margin: 0 0 16px 0; color: #6B5744; line-height: 1.7;">
                We're happy to have you with us!
              </p>
              <p style="margin: 0 0 24px 0; color: #6B5744; line-height: 1.7;">
                Enjoy your experience with Zarish.
              </p>
              <p style="margin: 0; color: #2C1D13; line-height: 1.7;">
                Best regards,<br>
                <strong style="color: #7B5B3A;">Zarish Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF6F0; border-top: 1px solid #E2D5C7; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #8C7B6B;">
                © ${new Date().getFullYear()} ZARISH by Nehala Mufeed. All rights reserved.
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
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: to,
        name: name || to.split('@')[0],
      },
    ],
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Email Service - Brevo] Brevo API error response:', errorData);
      return {
        success: false,
        error: errorData.message || `Failed with status ${response.status}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    console.log(
      `[Email Service - Brevo] Welcome email successfully sent to ${to} (MessageId: ${data.messageId || 'sent'})`
    );
    return { success: true };
  } catch (error: any) {
    console.error('[Email Service - Brevo] Unexpected error sending welcome email:', error);
    return { success: false, error: error?.message || 'Unknown network error' };
  }
}

/**
 * Send a password reset email using Brevo (Sendinblue) Transactional Email API v3.
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
    console.warn('[Email Service - Brevo] Brevo not fully configured.');
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

  const subject = 'Reset Your Zarish Password';
  const plainText = `Hello,

We received a request to reset your password for your Zarish account.

To reset your password, please open the following link:
${resetUrl}

If you did not make this request, you can safely ignore this email. Your password will remain unchanged.

Best regards,
Zarish Team`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF6F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2C1D13;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #FAF6F0; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 560px; background-color: #FFFFFF; border-radius: 20px; border: 1px solid #E2D5C7; overflow: hidden; box-shadow: 0 4px 24px rgba(44, 29, 19, 0.05);">
          <!-- Header with Logo -->
          <tr>
            <td align="center" style="padding: 32px 24px 22px 24px; border-bottom: 1px solid #F5EDE3; background-color: #FFFFFF;">
              <img
                src="cid:logo-zarish.png"
                alt="ZARISH"
                width="160"
                style="display: block; margin: 0 auto; height: auto; max-height: 40px; width: 160px; max-width: 100%; border: 0; outline: none; text-decoration: none;"
              />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; font-size: 15px; line-height: 1.7; color: #3D2B1F;">
              <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #2C1D13;">
                Reset Your Password
              </p>
              <p style="margin: 0 0 20px 0; color: #6B5744; line-height: 1.7;">
                We received a request to reset the password for your account associated with <strong>${to}</strong>. Click the button below to choose a new password.
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="border-radius: 50px; background-color: #2C1D13;">
                    <a
                      href="${resetUrl}"
                      target="_blank"
                      style="font-size: 14px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #FFFFFF; background-color: #2C1D13; border: 14px 32px; padding: 14px 32px; display: inline-block; text-decoration: none; border-radius: 50px;"
                    >
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #8C7B6B; line-height: 1.6;">
                If the button above does not work, copy and paste this link into your browser:
                <br>
                <a href="${resetUrl}" style="color: #7B5B3A; word-break: break-all; font-size: 12px;">${resetUrl}</a>
              </p>
              <p style="margin: 0 0 20px 0; font-size: 13px; color: #8C7B6B; line-height: 1.6;">
                If you did not request this password reset, please disregard this email. Your password will remain unchanged.
              </p>
              <p style="margin: 0; color: #2C1D13; line-height: 1.7;">
                Best regards,<br>
                <strong style="color: #7B5B3A;">Zarish Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #FAF6F0; border-top: 1px solid #E2D5C7; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #8C7B6B;">
                © ${new Date().getFullYear()} ZARISH by Nehala Mufeed. All rights reserved.
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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Email Service - Brevo] Reset email error:', errorData);
      return {
        success: false,
        error: errorData.message || `Failed with status ${response.status}`,
      };
    }

    const data = await response.json().catch(() => ({}));
    console.log(`[Email Service - Brevo] Reset password email sent to ${to} (MessageId: ${data.messageId || 'sent'})`);
    return { success: true };
  } catch (error: any) {
    console.error('[Email Service - Brevo] Unexpected error sending reset email:', error);
    return { success: false, error: error?.message || 'Unknown network error' };
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
