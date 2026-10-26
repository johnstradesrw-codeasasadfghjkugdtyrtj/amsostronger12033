export const HERO_IMAGE = "https://i.ibb.co/DfNy0vr0/image.png";
export const TELEGRAM_USERNAME = "fxcodding";
export const telegramLink = (message: string) =>
  `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
export const SUPPORT_URL = telegramLink("Hello QMAM team, I need help with my account.");
export const ACCOUNT_MGMT_URL = SUPPORT_URL;
export const SUPPORT_EMAIL = "qmam.site@gmail.com";
export const SUPPORT_EMAIL_URL = `mailto:${SUPPORT_EMAIL}`;
export const forgotPasswordLink = (email?: string) =>
  telegramLink(`Hello, my email is ${email?.trim() || "[your email]"}. Please help me change my password.`);
export const ADMIN_EMAILS = ["dufashwenayo@gmail.com", "eclifunded@gmail.com"] as const;

export type SubLike = { expires_at: string; revoked: boolean };
/** A subscription grants paid access only if not revoked and not yet expired. */
export function isSubscriptionActive(s: SubLike | null | undefined, now = new Date()): boolean {
  if (!s) return false;
  return !s.revoked && new Date(s.expires_at).getTime() > now.getTime();
}
export function daysRemaining(expires: string, now = new Date()): number {
  return Math.max(0, Math.ceil((new Date(expires).getTime() - now.getTime()) / 86400000));
}

export const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_PROOF_BYTES = 5 * 1024 * 1024;
export function validateProof(file: { type: string; size: number }): string | null {
  if (!ALLOWED_PROOF_TYPES.includes(file.type)) return "Please upload a JPG, PNG or WebP image.";
  if (file.size > MAX_PROOF_BYTES) return "Image must be 5 MB or smaller.";
  return null;
}
