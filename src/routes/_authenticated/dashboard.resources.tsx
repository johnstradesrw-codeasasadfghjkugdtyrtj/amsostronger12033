import { createFileRoute } from "@tanstack/react-router";
import { PageHead, Card } from "@/components/dash-ui";
import { ACCOUNT_MGMT_URL, SUPPORT_URL, RISK_DISCLAIMER } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/resources")({ component: Resources });

function Resources() {
  return (
    <div className="space-y-4">
      <PageHead title="Resources & Guides" sub="Free for every registered account." />
      <Card title="About the bot">
        <p className="text-sm leading-relaxed">Quantum Multi Assets Matrix (Matrix Quantum MT5) is an automated trading system (Expert Advisor) designed for MetaTrader 5. It operates on a configured MT5 account and follows the rules set in its configuration. Live execution through this website requires the MT5 bridge, which is still being integrated.</p>
      </Card>
      <Card title="Getting started with MT5">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Open an MT5 account with a broker that supports Expert Advisors.</li>
          <li>Install MetaTrader 5 on a computer or VPS that stays online.</li>
          <li>Enable "Algo Trading" in MT5 (Tools → Options → Expert Advisors).</li>
          <li>Start on a demo account until you understand the behaviour and risks.</li>
          <li>Contact support on Telegram for current setup files and instructions.</li>
        </ol>
      </Card>
      <Card title="Risk education">
        <p className="text-sm text-muted-foreground">{RISK_DISCLAIMER}</p>
      </Card>
      <Card title="Downloads">
        <p className="text-sm text-muted-foreground">No downloadable files have been configured yet.</p>
      </Card>
      <Card title="Support">
        <div className="flex flex-col gap-1 text-sm">
          <a className="text-primary" href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Click Here (@qmamatrix)</a>
          <a className="text-primary" href={SUPPORT_URL} target="_blank" rel="noreferrer">Technical Support on Telegram (@fxcodding)</a>
        </div>
      </Card>
    </div>
  );
}
