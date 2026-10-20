import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-chrome";
import { Steps, SectionTitle, SupportCta } from "@/components/marketing";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — Quantum Multi Assets Matrix" },
      { name: "description", content: "How It Works for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:title", content: "How It Works — Quantum Multi Assets Matrix" },
      { property: "og:description", content: "How It Works for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Quantum Multi Assets Matrix" title="How It Works" />
        <Steps />
        <div className="mt-12"><SupportCta /></div>
      </section>
    </PublicLayout>
  );
}
