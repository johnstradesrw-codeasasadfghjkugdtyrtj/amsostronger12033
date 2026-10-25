import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, Activity, Shield, LayoutDashboard, Upload, BadgeCheck, MessageCircle, Clock, Sliders, Link2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";

export function SectionTitle({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">{eyebrow}</p>
      <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {sub && <p className="mt-3 text-muted-foreground">{sub}</p>}
    </div>
  );
}

const features = [
  { icon: Activity, t: "MT5-oriented workflow", d: "Built around MetaTrader 5 setup and operation.", pending: false },
    { icon: LayoutDashboard, t: "Client dashboard", d: "Overview, subscription, payments and profile in one place.", pending: false },
  { icon: Upload, t: "Secure payment submission", d: "Upload payment proof to private storage.", pending: false },
  { icon: BadgeCheck, t: "Payment review & approval", d: "Administrators verify every payment manually.", pending: false },
  { icon: Clock, t: "Subscription expiry tracking", d: "Countdown and automatic lock on expiry.", pending: false },
  { icon: MessageCircle, t: "Telegram support", d: "Account management and technical support on Telegram.", pending: false },
  { icon: Shield, t: "Account & subscription management", d: "History of every payment and subscription.", pending: false },
  { icon: Link2, t: "Bot connection status", d: "Live MT5 bridge status.", pending: false },
  { icon: Sliders, t: "Configurable risk controls", d: "Managed by the connected trading engine.", pending: false },
];

export function FeatureGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {features.map((f) => (
        <div key={f.t} className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <f.icon className="h-6 w-6 text-primary" />
            {f.pending && <Badge variant="outline">Integration pending</Badge>}
          </div>
          <h3 className="mt-4 font-display font-semibold">{f.t}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
        </div>
      ))}
    </div>
  );
}

const steps = [
  "Create your free account.",
  "Choose a subscription plan.",
  "Pay using an enabled payment method.",
  "Upload your payment screenshot and transaction details.",
  "Wait for administrator approval before accessing paid features.",
];
export function Steps() {
  return (
    <ol className="grid gap-4 md:grid-cols-5">
      {steps.map((s, i) => (
        <li key={s} className="rounded-2xl border border-border bg-card p-5">
          <span className="font-display text-3xl font-bold text-primary">0{i + 1}</span>
          <p className="mt-2 text-sm">{s}</p>
        </li>
      ))}
    </ol>
  );
}

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plans").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
    staleTime: 60000,
  });
}

export function PricingGrid() {
  const { data: plans, isLoading } = usePlans();
  if (isLoading) return <p className="text-center text-muted-foreground">Loading plans…</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {plans?.filter((p) => p.visible && p.active).map((p) => (
        <div key={p.id} className={`relative flex flex-col rounded-2xl border bg-card p-6 ${p.featured ? "border-primary shadow-[var(--shadow-glow)]" : "border-border"}`}>
          {p.featured && <Badge className="absolute -top-3 left-6">Recommended</Badge>}
          <h3 className="font-display text-lg font-semibold">{p.name}</h3>
          <p className="mt-3 font-display text-3xl font-bold">
            {p.custom_quote ? "Custom quote" : `$${Number(p.price).toLocaleString()}`}
          </p>
          <p className="text-sm text-muted-foreground">{p.custom_quote ? "Terms agreed privately" : `${p.duration_days} days`}</p>
          <p className="mt-4 text-sm text-muted-foreground">{p.description}</p>
          <ul className="mt-4 flex-1 space-y-2 text-sm">
            {p.features.map((f) => (
              <li key={f} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-primary" />{f}</li>
            ))}
          </ul>
          {p.custom_quote ? (
            <Button variant="outline" className="mt-6" asChild><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Talk to Us</a></Button>
          ) : (
            <Button className="mt-6" asChild><Link to="/dashboard/pay/$planId" params={{ planId: p.id }}>Subscribe Now</Link></Button>
          )}
        </div>
      ))}
    </div>
  );
}

const faqs: [string, string][] = [
  ["How do I subscribe?", "Create a free account, pick a plan on the Pricing page, pay with an enabled method, then upload your payment screenshot."],
  ["Which payment methods are supported?", "USDT (TRC20) and Bitcoin are prepared. A method is only usable once the administrator has configured its receiving details."],
  ["Why must I upload a payment screenshot?", "It gives the administrator evidence to verify your payment manually."],
  ["How long does payment approval take?", "Approval is manual. For the current timeframe, contact support on Telegram."],
  ["When will my dashboard unlock?", "Paid features unlock as soon as an administrator approves your payment."],
  ["How do I connect my MT5 account?", "Follow the Connect MT5 page in your dashboard. The live execution bridge is still being integrated."],
  ["How do I renew my subscription?", "Use the Renew button in your dashboard. Renewal time is added after your current expiry."],
  ["What happens when my subscription expires?", "Paid features lock automatically."],
  ["Where can I get account-management assistance?", "Use 'Account Management — Click Here' (Telegram @fxcodding)."],
  ["How do I contact support?", "Technical support is on Telegram at @fxcodding."],
];
export function FaqList() {
  return (
    <Accordion type="single" collapsible className="mx-auto max-w-3xl">
      {faqs.map(([q, a]) => (
        <AccordionItem key={q} value={q}>
          <AccordionTrigger className="text-left">{q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function SupportCta() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Button variant="outline" asChild><a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Click Here</a></Button>
      <Button variant="outline" asChild><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Contact Support on Telegram</a></Button>
    </div>
  );
}
