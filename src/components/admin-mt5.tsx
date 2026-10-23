import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link2, ShieldCheck, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export function AdminMt5({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const [broker, setBroker] = useState('');
  const [server, setServer] = useState('');
  const [account, setAccount] = useState('');
  const [busy, setBusy] = useState(false);
  const { data, error } = useQuery({ queryKey: ['admin-mt5'], queryFn: async () => { const result = await supabase.from('mt5_setup_requests').select('*').order('created_at', { ascending: false }); if (result.error) throw result.error; return result.data; } });
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true);
    const { error } = await supabase.from('mt5_setup_requests').insert({ user_id: uid, broker: broker.trim(), server: server.trim(), account_number: account.trim() });
    setBusy(false);
    if (error) { toast.error('Unable to save setup details.'); return; }
    setBroker(''); setServer(''); setAccount(''); toast.success('Setup details saved — not connected'); qc.invalidateQueries({ queryKey: ['admin-mt5'] });
  };
  const remove = async (id: string) => { const { error } = await supabase.from('mt5_setup_requests').delete().eq('id', id); if (error) { toast.error('Unable to remove setup.'); return; } qc.invalidateQueries({ queryKey: ['admin-mt5'] }); };
  return <section className="mt-6 space-y-6">
    <div className="flex items-start gap-3"><Link2 className="mt-1 h-6 w-6 text-primary" /><div><h2 className="font-display text-xl font-bold">MT5 account setup</h2><p className="mt-2 text-sm text-muted-foreground">Save broker and account details for technical setup. A secure MT5 service is required before any connection or trading.</p></div></div>
    <form onSubmit={save} className="grid gap-4 border-y py-6 sm:grid-cols-3">
      <div className="space-y-2"><Label htmlFor="mt5-broker">Broker</Label><Input id="mt5-broker" required maxLength={120} value={broker} onChange={e => setBroker(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="mt5-server">MT5 server</Label><Input id="mt5-server" required maxLength={120} value={server} onChange={e => setServer(e.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="mt5-account">Account number</Label><Input id="mt5-account" inputMode="numeric" pattern="[0-9]+" required maxLength={30} value={account} onChange={e => setAccount(e.target.value)} /></div>
      <div className="flex flex-wrap items-center gap-4 sm:col-span-3"><Button type="submit" disabled={busy}>Save setup details</Button><span className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />No passwords collected</span></div>
    </form>
    {error && <p role="alert">Unable to load saved accounts.</p>}
    {data?.map(item => <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4"><div><p className="font-semibold">{item.broker} · {item.account_number}</p><p className="text-sm text-muted-foreground">{item.server}</p></div><div className="flex items-center gap-2"><Badge variant="outline">Setup pending · Not connected</Badge>{item.user_id === uid && <Button size="icon" variant="ghost" aria-label="Remove saved setup" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>}</div></div>)}
  </section>;
}