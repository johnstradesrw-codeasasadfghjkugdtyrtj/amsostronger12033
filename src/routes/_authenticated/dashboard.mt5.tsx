import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHead, Card } from "@/components/dash-ui";
import { useProtectedFeature } from '@/hooks/use-entitlement';
import { SubscriptionLock } from '@/components/subscription-lock';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute("/_authenticated/dashboard/mt5")({ head: () => pageHead('Connect MT5','Secure subscription-based MT5 account access.'), component: Mt5 });

function Mt5() {
  const { data, isLoading, error } = useProtectedFeature('mt5');
  if (isLoading) return <p role="status">Checking subscription access…</p>;
  if (error || !data) return <p role="alert">Unable to verify access. Please try again or contact support.</p>;
  if (!data.allowed) return <SubscriptionLock entitlement={data.entitlement} />;
  const body = (
    <div className="space-y-4">
      <Card title="Integration status">
        <p className="mb-3 font-semibold">{data.entitlement.plan_name} · Up to {data.entitlement.mt5_limit} MT5 account(s)</p>
        <Badge variant="outline">Integration Pending</Badge>
        <p className="mt-3 text-sm text-muted-foreground">MT5 accounts can't be connected from the website yet. Once the secure execution bridge is configured, you'll add your broker server and account number here. We will never ask for your broker password in a plain form.</p>
      </Card>
      <Card title="Setup instructions">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Have your broker name, MT5 server and account number ready.</li>
          <li>Contact technical support on Telegram for the current setup procedure.</li>
          <li>Run on a VPS for uninterrupted operation.</li>
        </ol>
      </Card>
    </div>
  );
  return (
    <div>
      <PageHead title="Connect MT5" />
      {body}
    </div>
  );
}
