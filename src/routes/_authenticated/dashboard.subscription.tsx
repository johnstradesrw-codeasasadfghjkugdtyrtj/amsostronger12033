import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHead, Card } from "@/components/dash-ui";
import { useAccount } from "@/hooks/use-account";
import { daysRemaining, isSubscriptionActive } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/subscription")({ component: Sub });

function Sub() {
  const { data } = useAccount();
  if (!data) return null;
  return (
    <div className="space-y-4">
      <PageHead title="My Subscription" />
      {data.active ? (
        <Card title="Current plan">
          <p className="font-display text-2xl font-bold">{data.active.plan_name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(data.active.starts_at).toLocaleDateString()} → {new Date(data.active.expires_at).toLocaleDateString()} · {daysRemaining(data.active.expires_at)} days left
          </p>
          <Button asChild className="mt-4"><Link to="/pricing">Renew</Link></Button>
        </Card>
      ) : (
        <Card title="Current plan">
          <p>You don't have a paid subscription. Your free resources are fully available.</p>
          <Button asChild className="mt-4"><Link to="/pricing">View Subscription Plans</Link></Button>
        </Card>
      )}
      <Card title="Subscription history">
        {data.subscriptions.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions yet.</p> : (
          <ul className="divide-y divide-border text-sm">
            {data.subscriptions.map((s) => (
              <li key={s.id} className="flex justify-between py-2">
                <span>{s.plan_name}</span>
                <span className="text-muted-foreground">{s.revoked ? "Revoked" : isSubscriptionActive(s) ? "Active" : "Expired"} · until {new Date(s.expires_at).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
