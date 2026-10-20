import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles } from "lucide-react";
import { usePlans } from "@/components/marketing";
import { PageHead } from "@/components/dash-ui";
import { SUPPORT_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/plans")({ component: Plans });

function Plans() {
  const { data: plans, isLoading } = usePlans();
  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  return (
    <div>
      <PageHead title="Choose a plan" sub="Tap a plan to pay." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {plans?.filter((p) => p.visible && p.active).map((p) => {
          const inner = (
            <>
              <div className="flex items-center justify-between gap-2">
                <h3 className="min-w-0 truncate font-display font-semibold">{p.name}</h3>
                {p.featured && <Sparkles className="h-4 w-4 shrink-0 text-accent" />}
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-primary">
                {p.custom_quote ? "Custom" : `$${Number(p.price)}`}
              </p>
              <p className="text-sm text-muted-foreground">{p.custom_quote ? "Talk to us" : `${p.duration_days} days`}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {p.features.slice(0, 3).map((f) => (
                  <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>
                ))}
              </ul>
            </>
          );
          const cls = `block rounded-2xl border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary ${p.featured ? "border-accent shadow-[var(--shadow-glow)]" : "border-border"}`;
          return p.custom_quote ? (
            <a key={p.id} href={SUPPORT_URL} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
          ) : (
            <Link key={p.id} to="/dashboard/pay/$planId" params={{ planId: p.id }} className={cls}>{inner}</Link>
          );
        })}
      </div>
    </div>
  );
}
