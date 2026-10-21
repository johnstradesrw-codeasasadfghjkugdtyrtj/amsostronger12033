import { pageHead } from '@/lib/metadata';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dash-ui";
import { useAccount, statusLabel } from "@/hooks/use-account";
import { daysRemaining } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/")({ head: () => pageHead('Account overview','Your verified subscription and payment status.'), component: Overview });

function Overview() {
  const { data, isLoading } = useAccount();
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  const { active, payments, profile } = data;
  const lastPay = payments[0];
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl font-bold">Hi{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""} 👋</h1>

      <div className="rounded-2xl bg-[image:var(--gradient-brand)] p-6 text-primary-foreground shadow-[var(--shadow-glow)]">
        {active ? (
          <>
            <p className="text-sm opacity-80">{active.plan_name}</p>
            <p className="font-display text-5xl font-bold">{daysRemaining(active.expires_at)}<span className="ml-2 text-lg font-medium">days left</span></p>
            <Button asChild variant="secondary" className="mt-4"><Link to="/dashboard/plans">Renew</Link></Button>
          </>
        ) : (
          <>
            <p className="font-display text-2xl font-bold">No active plan</p>
            <p className="text-sm opacity-80">Subscribe to unlock the bot.</p>
            <Button asChild variant="secondary" className="mt-4"><Link to="/dashboard/plans">Subscribe</Link></Button>
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

      <Button asChild variant="outline"><Link to="/dashboard/mt5">Connect MT5</Link></Button>
      <Card title="Bot"><p className="font-semibold">Not connected yet</p></Card>
    </div>
  );
}
