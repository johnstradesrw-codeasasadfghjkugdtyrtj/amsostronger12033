import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site-chrome";
import { FaqList, SectionTitle, SupportCta } from "@/components/marketing";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — Quantum Multi Assets Matrix" },
      { name: "description", content: "FAQ for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:title", content: "FAQ — Quantum Multi Assets Matrix" },
      { property: "og:description", content: "FAQ for the Quantum Multi Assets Matrix MT5 platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Faq,
});

function Faq() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-16">
        <SectionTitle eyebrow="Quantum Multi Assets Matrix" title="FAQ" />
        <FaqList />
        <div className="mt-12"><SupportCta /></div>
      </section>
    </PublicLayout>
  );
}
