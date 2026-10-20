import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicLayout } from "@/components/site-chrome";
import { FeatureGrid, Steps, PricingGrid, FaqList, SectionTitle } from "@/components/marketing";
import { HERO_IMAGE, ACCOUNT_MGMT_URL } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Quantum Multi Assets Matrix — MT5 Trading Platform" },
      { name: "description", content: "Explore the platform, access free resources, and discover tools for your MT5 trading workflow." },
      { property: "og:title", content: "Quantum Multi Assets Matrix" },
      { property: "og:description", content: "MT5-focused automated trading platform with free resources and subscription access." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: HERO_IMAGE },
      { name: "twitter:image", content: HERO_IMAGE },
    ],
  }),
  component: Index,
});

function HeroImage() {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-border bg-card text-muted-foreground">
        Quantum Multi Assets Matrix
      </div>
    );
  return (
    <img
      src={HERO_IMAGE}
      alt="Quantum Multi Assets Matrix trading platform"
      onError={() => setFailed(true)}
      className="h-auto w-full rounded-2xl border border-border object-contain shadow-[var(--shadow-glow)]"
    />
  );
}

function Index() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Matrix Quantum MT5</p>
          <h1 className="mt-4 bg-[image:var(--gradient-brand)] bg-clip-text font-display text-4xl font-bold leading-tight text-transparent sm:text-6xl">
            Quantum Multi Assets Matrix
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            Explore the platform, access available resources, and discover tools designed for your MT5 trading workflow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild><Link to="/auth" search={{ mode: "signup" }}>Create Free Account</Link></Button>
            <Button size="lg" variant="outline" asChild><Link to="/dashboard/resources">Explore Resources</Link></Button>
            <Button size="lg" variant="secondary" asChild><a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management — Click Here</a></Button>
          </div>
          <p className="mt-6 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" /> Trading involves risk. Profits are not guaranteed.
          </p>
        </div>
        <HeroImage />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="How it works" title="Five clear steps" />
        <Steps />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Features" title="Built for a serious trading workflow" />
        <FeatureGrid />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Pricing" title="Choose your plan" />
        <PricingGrid />
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="FAQ" title="Questions, answered" />
        <FaqList />
      </section>
    </PublicLayout>
  );
}
