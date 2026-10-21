import { Link } from '@tanstack/react-router';
import { LockKeyhole } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { accessLabels, type Entitlement } from '@/lib/entitlement';
import { SUPPORT_URL } from '@/lib/site';
export function SubscriptionLock({ entitlement, feature = 'MT5' }: { entitlement: Entitlement; feature?: string }) {
  const renew = entitlement.status === 'expired' || entitlement.status === 'revoked';
  return <section className="mx-auto max-w-2xl py-8 sm:py-14">
    <LockKeyhole className="h-10 w-10 text-primary" aria-hidden />
    <p className="mt-6 text-sm font-semibold text-primary">{accessLabels[entitlement.status]}</p>
    <h1 className="mt-3 font-display text-2xl font-bold sm:text-3xl">{feature} CONNECTION LOCKED</h1>
    <p className="mt-4 text-lg">An active subscription is required to connect your MetaTrader 5 account.</p>
    <p className="mt-3 text-muted-foreground">Choose a subscription plan and complete payment verification to unlock MT5 account connection and eligible trading features.</p>
    {entitlement.status === 'pending' && <p className="mt-5 border-l-2 border-primary pl-4">Your payment is awaiting administrator verification. MT5 connection will become available after your subscription is approved.</p>}
    {renew && <p className="mt-5">Your subscription has {entitlement.status === 'expired' ? 'expired' : 'been revoked'}. Renew your subscription to request access again.</p>}
    {entitlement.status === 'suspended' && <p className="mt-5">Your account is suspended. Contact technical support to resolve access.</p>}
    {entitlement.status === 'scheduled' && <p className="mt-5">Your approved subscription has not started yet.</p>}
    {entitlement.status === 'active' && <p className="mt-5">Your current plan does not include this feature.</p>}
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button asChild><Link to="/dashboard/plans">{renew ? 'Renew Subscription' : 'View Subscription Plans'}</Link></Button>
      <Button variant="outline" asChild><Link to="/dashboard/payments">My Payment Status</Link></Button>
      <Button variant="ghost" asChild><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact Technical Support</a></Button>
    </div>
  </section>;
}