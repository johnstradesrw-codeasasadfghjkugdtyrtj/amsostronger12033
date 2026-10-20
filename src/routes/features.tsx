import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-chrome";
import { FeatureGrid, SectionTitle, SupportCta } from "@/components/marketing";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — Quantum Multi Assets Matrix" },
      { name: "description", content: "Features for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:title", content: "Features — Quantum Multi Assets Matrix" },
      { property: "og:description", content: "Features for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Features,
});

function Features() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Quantum Multi Assets Matrix" title="Features" />
        <FeatureGrid />
        <div className="mt-12"><SupportCta /></div>
      </section>
    </PublicLayout>
  );
}
