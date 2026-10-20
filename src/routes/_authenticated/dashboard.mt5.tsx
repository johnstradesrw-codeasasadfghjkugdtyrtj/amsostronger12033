import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { PageHead, Card, PaidLock } from "@/components/dash-ui";
import { useAccount } from "@/hooks/use-account";

export const Route = createFileRoute("/_authenticated/dashboard/mt5")({ component: Mt5 });

function Mt5() {
  const { data } = useAccount();
  const body = (
    <div className="space-y-4">
      <Card title="Integration status">
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
      {data?.active ? body : <PaidLock>{body}</PaidLock>}
    </div>
  );
}
