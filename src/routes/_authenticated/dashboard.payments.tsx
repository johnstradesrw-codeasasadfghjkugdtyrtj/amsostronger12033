import { pageHead } from '@/lib/metadata';
import { createFileRoute, Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHead, Card } from "@/components/dash-ui";
import { useAccount, statusLabel } from "@/hooks/use-account";
import { SUPPORT_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/payments")({ head: () => pageHead('Payment history','Your payment verification and subscription history.'), component: Payments });

function Payments() {
  const { data } = useAccount();
  if (!data) return null;
  return (
    <div className="space-y-4">
      <PageHead title="Payment History" sub="Verification is manual and done by an administrator." />
      <Button asChild variant="outline"><Link to="/dashboard/subscription">My Subscription History</Link></Button>
      {data.payments.length === 0 && (
        <Card><p className="text-sm">No payments yet.</p><Button asChild className="mt-3" size="sm"><Link to="/dashboard/plans">View Plans</Link></Button></Card>
      )}
      {data.payments.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold">{p.plan_name} · ${Number(p.amount)} {p.currency}</p>
              <p className="text-xs text-muted-foreground">{p.reference} · {new Date(p.created_at).toLocaleString()} · {p.method_name}</p>
            </div>
            <Badge variant={p.status === "approved" ? "default" : p.status === "rejected" ? "destructive" : "outline"}>{statusLabel[p.status]}</Badge>
          </div>
          {p.status === "rejected" && (
            <div className="mt-3 text-sm">
              <p>Reason: {p.rejection_reason}</p>
              <div className="mt-2 flex gap-2">
                <Button asChild size="sm"><Link to="/dashboard/pay/$planId" params={{ planId: p.plan_id }}>Resubmit</Link></Button>
                <Button asChild size="sm" variant="outline"><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact Support</a></Button>
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
