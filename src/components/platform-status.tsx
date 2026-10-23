import { useQuery } from '@tanstack/react-query';
import { Users, Link2, Bot, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export function PlatformStatus() {
  const { data } = useQuery({ queryKey: ['registered-user-total'], queryFn: async () => { const result = await supabase.rpc('registered_user_total'); if (result.error) throw result.error; return result.data; }, refetchInterval: 60000 });
  const stats = [
    { icon: Users, label: 'Registered users', value: data === undefined ? '—' : Number(data).toLocaleString(), note: 'Current platform total' },
    { icon: Link2, label: 'MT5 connection', value: 'Setup pending', note: 'Secure service not connected' },
    { icon: Bot, label: 'Bot status', value: 'Not connected', note: 'No live heartbeat available' },
    { icon: Coins, label: 'Featured pair', value: 'GOLD', note: 'XAUUSD · Activity unverified' },
  ];
  return <section aria-label="Platform overview" className="border-y bg-secondary/40"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-5 py-8 lg:grid-cols-4">{stats.map(stat => <div key={stat.label}><div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><stat.icon className="h-4 w-4 text-primary" />{stat.label}</div><p className="mt-3 font-display text-lg font-bold sm:text-2xl">{stat.value}</p><p className="mt-1 text-xs text-muted-foreground">{stat.note}</p></div>)}</div></section>;
}