import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Card, PaidLock } from "@/components/dash-ui";
import { useAccount } from "@/hooks/use-account";

export const Route = createFileRoute("/_authenticated/dashboard/bot")({ component: BotPage });

function BotPage() {
  const { data } = useAccount();
  const body = (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card title="Bot status"><p className="font-semibold">Not Connected</p></Card>
      <Card title="MT5 bridge"><p className="font-semibold">Integration Pending</p></Card>
      <Card title="Last heartbeat"><p className="font-semibold">—</p></Card>
      <Card title="Controls"><p className="text-sm text-muted-foreground">Start/stop and emergency stop will appear once the trading engine is connected.</p></Card>
    </div>
  );
  return (
    <div>
      <PageHead title="Bot Dashboard" sub="No live trading activity is shown until a real MT5 integration is connected." />
      {data?.active ? body : <PaidLock>{body}</PaidLock>}
    </div>
  );
}
