import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';

const REPORTED_PROFIT = 6_872_393;

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

export function PlatformStatus() {
  const profit = useCountUp(REPORTED_PROFIT);
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
          </dl>
        </div>
      </div>
    </section>
  );
}
