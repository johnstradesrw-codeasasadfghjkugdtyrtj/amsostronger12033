import { useQuery } from '@tanstack/react-query';
import { Users, Link2, Bot, Coins, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function PlatformStatus() {
  const { data } = useQuery({ queryKey: ['registered-user-total'], queryFn: async () => { const result = await supabase.rpc('registered_user_total'); if (result.error) throw result.error; return result.data; }, refetchInterval: 60000 });
  const stats = [
    { icon: Users, label: 'Registered users', value: data === undefined ? '—' : Number(data).toLocaleString(), note: 'Current platform total' },
    { icon: Link2, label: 'MT5 connection', value: 'Setup pending', note: 'Secure service not connected' },
    { icon: Bot, label: 'Bot status', value: 'Not connected', note: 'No live heartbeat available' },
    { icon: Coins, label: 'Featured pair', value: 'GOLD', note: 'XAUUSD · Activity unverified' },
  ];
  return <section aria-label="Platform overview" className="border-y bg-secondary/40">
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-primary"><TrendingUp className="h-5 w-5" />Owner-reported total bot profit</p>
          <p className="mt-3 font-display text-3xl font-bold sm:text-5xl">6,872,393 <span className="text-base font-medium text-muted-foreground">USD</span></p>
          <p className="mt-2 max-w-xl text-xs text-muted-foreground">Reported across users’ bot trades. Unverified; no trade history feed is connected.</p>
        </div>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 text-sm sm:grid-cols-3">
          <div><dt className="text-xs text-muted-foreground">Owner-reported users</dt><dd className="mt-2 text-xl font-bold">892+</dd></div>
          <div><dt className="text-xs text-muted-foreground">Owner-reported bot</dt><dd className="mt-2 font-semibold text-primary">Connected · Active</dd></div>
          <div><dt className="text-xs text-muted-foreground">Owner-reported pair</dt><dd className="mt-2 font-semibold">GOLD / XAUUSD</dd><dd className="mt-1 text-xs text-muted-foreground">Activity not independently verified</dd></div>
        </dl>
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actual platform status</p>
      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4">{stats.map(stat => <div key={stat.label}><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><stat.icon className="h-4 w-4 text-primary" />{stat.label}</div><p className="mt-3 font-display text-lg font-bold sm:text-2xl">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.note}</p></div>)}</div>
    </div>
  </section>;
}