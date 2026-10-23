import { pageHead } from '@/lib/metadata';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dash-ui";
import { useAccount, statusLabel } from "@/hooks/use-account";
import { daysRemaining } from "@/lib/site";
import { ArrowRight, Check, CreditCard, Link2, MessageCircle, Sparkles, BookOpen } from 'lucide-react';
import { usePlans } from '@/components/marketing';

export const Route = createFileRoute("/_authenticated/dashboard/")({ head: () => pageHead('Account overview','Your verified subscription and payment status.'), component: Overview });

function Overview() {
  const { data, isLoading } = useAccount();
  const { data: plans } = usePlans();
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  const { active, payments, profile } = data;
  const lastPay = payments[0];
  const featured = plans?.find(p => p.active && p.visible && p.featured && !p.custom_quote);
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</h1>

      <div className="border-y border-primary bg-primary p-6 text-primary-foreground">
        {active ? (
          <>
            <p className="text-sm opacity-80">{active.plan_name}</p>
            <p className="font-display text-5xl font-bold">{daysRemaining(active.expires_at)}<span className="ml-2 text-lg font-medium">days left</span></p>
            <Button asChild variant="secondary" className="mt-4"><Link to="/dashboard/plans">Renew</Link></Button>
          </>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">Your next step</p>
            <p className="mt-2 font-display text-2xl font-bold">Choose your Matrix plan</p>
            <p className="mt-2 text-sm opacity-80">Eligible MT5 access starts with an approved subscription.</p>
            <Button asChild variant="secondary" className="mt-4"><Link to="/dashboard/plans">Explore plans<ArrowRight className="h-4 w-4" /></Link></Button>
          </>
        )}
      </div>

      {lastPay && (
        <Link to="/dashboard/payments" className="block">
          <Card title="Latest payment">
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate">{lastPay.plan_name} · ${Number(lastPay.amount)}</span>
              <span className={`shrink-0 rounded-full px-3 py-1 text-xs ${lastPay.status === "approved" ? "bg-primary/20 text-primary" : lastPay.status === "rejected" ? "bg-destructive/20 text-destructive" : "bg-accent/20 text-accent"}`}>
                {statusLabel[lastPay.status]}
              </span>
            </div>
            {lastPay.status === "rejected" && <p className="mt-2 text-sm text-muted-foreground">{lastPay.rejection_reason}</p>}
          </Card>
        </Link>
      )}

      <section className="grid gap-4 md:grid-cols-2" aria-label="MT5 and subscription">
        <div className="rounded-lg border border-primary/30 bg-card p-5">
          <Link2 className="h-6 w-6 text-primary" />
          <h2 className="mt-3 font-display text-xl font-bold">Your MT5 account</h2>
          <p className="mt-2 text-sm text-muted-foreground">{active ? 'Subscription active. Secure connection service pending.' : 'An approved subscription is required for MT5 access.'}</p>
          <Button asChild className="mt-5 w-full"><Link to="/dashboard/mt5"><Link2 className="h-4 w-4" />Connect MT5<ArrowRight className="h-4 w-4" /></Link></Button>
          <p className="mt-3 text-xs text-muted-foreground">Your bot: not connected · No live heartbeat</p>
        </div>
        {featured ? <div className="rounded-lg border border-border bg-card p-5">
          <p className="flex items-center gap-2 text-xs font-semibold text-primary"><Sparkles className="h-4 w-4" />Featured subscription</p>
          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2"><h2 className="font-display text-xl font-bold">{featured.name}</h2><p className="text-2xl font-bold text-primary">{featured.currency} {Number(featured.price).toLocaleString()}</p></div>
          <p className="mt-1 text-sm text-muted-foreground">{featured.duration_days} days · {featured.mt5_limit} MT5 account{featured.mt5_limit === 1 ? '' : 's'}</p>
          <ul className="mt-4 space-y-2 text-sm">{featured.features.slice(0, 3).map(feature => <li key={feature} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{feature}</li>)}</ul>
          <Button asChild variant="outline" className="mt-5 w-full"><Link to="/dashboard/plans">Compare subscriptions<ArrowRight className="h-4 w-4" /></Link></Button>
        </div> : <div className="rounded-lg border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">Your subscription</h2><p className="mt-2 text-sm text-muted-foreground">Find the duration and account allowance that suit you.</p><Button asChild variant="outline" className="mt-5"><Link to="/dashboard/plans">View plans</Link></Button></div>}
      </section>
      <section aria-label="Account shortcuts" className="border-y border-border py-5">
        <h2 className="mb-3 font-display font-semibold">Your account, at a glance</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button asChild variant="outline" className="justify-start"><Link to="/dashboard/payments"><CreditCard className="h-4 w-4" />Payment history</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/resources"><BookOpen className="h-4 w-4" />Resources & guides</Link></Button>
          <Button asChild variant="outline" className="justify-start"><Link to="/dashboard/support"><MessageCircle className="h-4 w-4" />Technical support</Link></Button>
        </div>
      </section>
    </div>
  );
}
