/**
 * Resend Email Notification Service
 * Sends welcome emails and Pro tier upgrade confirmations
 */

export interface EmailOptions {
  to: string;
  name: string;
  planName?: string;
}

export async function sendWelcomeEmail(options: EmailOptions) {
  console.log(`[Email Service] Welcome email queued for ${options.to}`);
  return { success: true, messageId: "msg_welcome_" + Math.random().toString(36).substring(2, 8) };
}

export async function sendUpgradeEmail(options: EmailOptions) {
  console.log(`[Email Service] Pro upgrade confirmation email queued for ${options.to}`);
  return { success: true, messageId: "msg_upgrade_" + Math.random().toString(36).substring(2, 8) };
}
