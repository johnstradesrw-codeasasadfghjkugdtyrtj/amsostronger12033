import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHead, Card } from "@/components/dash-ui";
import { useAccount, statusLabel } from "@/hooks/use-account";
import { daysRemaining } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/")({ component: Overview });

function Overview() {
  const { data, isLoading } = useAccount();
  if (isLoading || !data) return <p className="text-muted-foreground">Loading…</p>;
  const { active, latest, payments, profile } = data;
  const lastPay = payments[0];
  const expired = !active && latest && !latest.revoked;
  return (
    <div>
      <PageHead title={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}`} sub="Your free resources are ready. Paid features unlock after payment approval." />
      {expired && <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">Your subscription has expired. Renew your plan to restore eligible access.</p>}
      {latest?.revoked && !active && <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">Your subscription was revoked{latest.revoke_reason ? `: ${latest.revoke_reason}` : "."}</p>}
      {lastPay?.status === "rejected" && <p className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm">Your last payment was rejected: {lastPay.rejection_reason}. <Link to="/pricing" className="text-primary underline">Submit a corrected payment</Link>.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card title="Free account"><p className="font-display text-xl font-semibold">Active</p><p className="text-sm text-muted-foreground">All general resources unlocked</p></Card>
        <Card title="Paid plan">
          <p className="font-display text-xl font-semibold">{active ? active.plan_name : "None"}</p>
          {active ? <Badge className="mt-1">Active</Badge> : <Badge variant="outline" className="mt-1">Not subscribed</Badge>}
        </Card>
        <Card title="Days remaining">
          <p className="font-display text-3xl font-bold text-primary">{active ? daysRemaining(active.expires_at) : "—"}</p>
          {active && <p className="text-xs text-muted-foreground">Expires {new Date(active.expires_at).toLocaleDateString()}</p>}
        </Card>
        <Card title="Latest payment">
          <p className="font-display text-xl font-semibold">{lastPay ? statusLabel[lastPay.status] : "None yet"}</p>
          {lastPay && <p className="text-xs text-muted-foreground">{lastPay.reference} · {lastPay.plan_name}</p>}
        </Card>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card title="Bot connection"><p className="font-semibold">Not Connected</p><p className="text-sm text-muted-foreground">The MT5 execution bridge is pending integration. No live trading data is shown.</p></Card>
        <Card title="Quick actions">
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><Link to="/dashboard/resources">Open Resources</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/pricing">{active ? "Renew" : "View Plans"}</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/dashboard/payments">Payment Status</Link></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
