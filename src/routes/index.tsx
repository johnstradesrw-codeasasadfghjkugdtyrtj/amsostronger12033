import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "QMAM — Quantum Multi-Asset Matrix | Botorian Dev Forex" },
      { name: "description", content: "QMAM: automated trading systems (Expert Advisors) for MetaTrader 4 and MetaTrader 5." },
      { property: "og:title", content: "QMAM — Quantum Multi-Asset Matrix" },
      { property: "og:description", content: "Automated trading software for MT4 and MT5." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20 text-foreground">
      <h1 className="text-4xl font-bold tracking-tight">QMAM</h1>
      <p className="mt-2 text-lg text-muted-foreground">Quantum Multi-Asset Matrix</p>
      <p className="mt-8 leading-relaxed">
        Quantum Multi-Asset Matrix systems generally refer to automated trading software
        (Expert Advisors or algorithmic bots) designed for platforms like MetaTrader 4 (MT4)
        or MetaTrader 5 (MT5).
      </p>
    </main>
  );
}
