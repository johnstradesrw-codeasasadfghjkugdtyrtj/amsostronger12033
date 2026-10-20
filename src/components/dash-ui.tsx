import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_URL } from "@/lib/site";

export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-2xl font-bold sm:text-3xl">{title}</h1>
      {sub && <p className="mt-1 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function Card({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      {title && <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">{title}</p>}
      {children}
    </div>
  );
}

/** Shown only for paid features when there is no active subscription. */
export function PaidLock({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-30 blur-sm" aria-hidden>{children}</div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center">
          <Lock className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 font-display text-xl font-bold">Paid subscription feature</h2>
          <p className="mt-2 text-sm text-muted-foreground">Choose a plan, submit your payment screenshot, and wait for approval to unlock this feature. Your free resources stay available.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button asChild size="sm"><Link to="/pricing">View Subscription Plans</Link></Button>
            <Button asChild size="sm" variant="outline"><Link to="/dashboard/payments">Check Payment Status</Link></Button>
            <Button asChild size="sm" variant="ghost"><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact Support</a></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
