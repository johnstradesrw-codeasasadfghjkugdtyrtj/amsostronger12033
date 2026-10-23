export type EntitlementStatus = 'none' | 'pending' | 'active' | 'expired' | 'revoked' | 'suspended' | 'scheduled';
export type Entitlement = { status: EntitlementStatus; allowed: boolean; subscription_id?: string; plan_name?: string; expires_at?: string; features?: string[]; mt5_limit?: number; server_time: string };
export function permitsFeature(e: Entitlement, feature: 'mt5' | 'bot' | 'premium') {
  if (!e.allowed || e.status !== 'active') return false;
  if (feature === 'mt5') return (e.mt5_limit ?? 0) > 0;
  if (feature === 'bot') return true; // every active paid plan includes the bot
  return (e.features ?? []).some(f => feature === 'bot' ? /\bbot\b|automated trading/i.test(f) : /premium trading/i.test(f));
}
export const accessLabels: Record<EntitlementStatus, string> = {
  none: 'No Active Subscription', pending: 'Payment Pending Approval', active: 'Active Subscription', expired: 'Subscription Expired', revoked: 'Subscription Revoked', suspended: 'Account Suspended', scheduled: 'Subscription Not Started',
};