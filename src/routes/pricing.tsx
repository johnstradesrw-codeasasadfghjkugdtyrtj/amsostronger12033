import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-chrome";
import { PricingGrid, SectionTitle, SupportCta } from "@/components/marketing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Quantum Multi Assets Matrix" },
      { name: "description", content: "Pricing for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:title", content: "Pricing — Quantum Multi Assets Matrix" },
      { property: "og:description", content: "Pricing for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Quantum Multi Assets Matrix" title="Pricing" />
        <PricingGrid />
        <div className="mt-12"><SupportCta /></div>
      </section>
    </PublicLayout>
  );
}
