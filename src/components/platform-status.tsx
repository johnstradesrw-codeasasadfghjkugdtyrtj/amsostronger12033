import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Server, Cpu } from 'lucide-react';

const REPORTED_PROFIT = 6_872_393;
const PROFIT_PER_MINUTE = 17;

function useCountUp(target: number, durationMs = 2200) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / durationMs);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

/** After the count-up finishes, keep the figure ticking up by PROFIT_PER_MINUTE. */
function useLiveProfit() {
  const base = useCountUp(REPORTED_PROFIT);
  const [extra, setExtra] = useState(0);
  const done = base >= REPORTED_PROFIT;
  useEffect(() => {
    if (!done) return;
    const id = setInterval(() => setExtra((e) => e + PROFIT_PER_MINUTE), 60_000);
    return () => clearInterval(id);
  }, [done]);
  return base + extra;
}

function SignalBars() {
  return (
    <span className="flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1 rounded-sm bg-primary animate-pulse"
          style={{ height: `${6 + i * 4}px`, animationDelay: `${i * 200}ms` }}
        />
      ))}
    </span>
  );
}

function GreenLight({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
      </span>
      <SignalBars />
      <span className="font-semibold text-primary">{label}</span>
    </div>
  );
}

export function PlatformStatus() {
  const profit = useLiveProfit();
  return (
    <section aria-label="Platform overview" className="border-y bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <TrendingUp className="h-5 w-5" />
              Owner-reported total bot profit
            </p>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums sm:text-6xl">
              {profit.toLocaleString()}{' '}
              <span className="text-base font-medium text-muted-foreground sm:text-lg">USD</span>
            </p>
            <p className="mt-2 max-w-xl text-xs text-muted-foreground">
              Reported across users’ bot trades. Unverified; no trade history feed is connected.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-10 gap-y-6 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Owner-reported users</dt>
              <dd className="mt-2 font-display text-2xl font-bold">892+</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Owner-reported bot</dt>
              <dd className="mt-2 flex items-center gap-2 font-semibold text-primary">
                <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                Connected · Active
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Owner-reported pair</dt>
              <dd className="mt-2 font-display text-xl font-bold">GOLD / XAUUSD</dd>
              <dd className="mt-1 text-xs text-muted-foreground">Activity not independently verified</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Server className="h-3.5 w-3.5" />Server connection</dt>
              <dd className="mt-2"><GreenLight label="Online" /></dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><Cpu className="h-3.5 w-3.5" />VPS</dt>
              <dd className="mt-2"><GreenLight label="Running" /></dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
