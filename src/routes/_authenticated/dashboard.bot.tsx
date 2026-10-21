import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Card } from "@/components/dash-ui";
import { useProtectedFeature } from '@/hooks/use-entitlement';
import { SubscriptionLock } from '@/components/subscription-lock';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute("/_authenticated/dashboard/bot")({ head: () => pageHead('Bot','Plan-eligible trading bot access and integration status.'), component: BotPage });

function BotPage() {
  const { data, isLoading, error } = useProtectedFeature('bot');
  if (isLoading) return <p role="status">Checking subscription access…</p>;
  if (error || !data) return <p role="alert">Unable to verify access. Please try again.</p>;
  if (!data.allowed) return <SubscriptionLock entitlement={data.entitlement} feature="BOT" />;
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
      {body}
    </div>
  );
}
