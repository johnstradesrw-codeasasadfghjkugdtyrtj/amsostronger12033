import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHead, Card } from "@/components/dash-ui";
import { useProtectedFeature } from '@/hooks/use-entitlement';
import { SubscriptionLock } from '@/components/subscription-lock';
import { pageHead } from '@/lib/metadata';
import { supabase } from '@/integrations/supabase/client';
import { Link2, ShieldCheck, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute("/_authenticated/dashboard/mt5")({ head: () => pageHead('Connect MT5','Secure subscription-based MT5 account access.'), component: Mt5 });

function Mt5() {
  const { data, isLoading, error } = useProtectedFeature('mt5');
  if (isLoading) return <p role="status">Checking subscription access…</p>;
  if (error || !data) return <p role="alert">Unable to verify access. Please try again or contact support.</p>;
  if (!data.allowed) return <SubscriptionLock entitlement={data.entitlement} />;
  return (
    <div>
      <PageHead title="Connect MT5" />
      <Mt5Setup planName={data.entitlement.plan_name} mt5Limit={data.entitlement.mt5_limit} />
    </div>
  );
}

function Mt5Setup({ planName, mt5Limit }: { planName: string | null; mt5Limit: number }) {
  const qc = useQueryClient();
  const [broker, setBroker] = useState('');
  const [server, setServer] = useState('');
  const [account, setAccount] = useState('');
  const [busy, setBusy] = useState(false);

  const { data: saved, error: loadError } = useQuery({
    queryKey: ['my-mt5-setup'],
    queryFn: async () => {
      const result = await supabase.from('mt5_setup_requests').select('*').order('created_at', { ascending: false });
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 30000,
  });

  const remaining = mt5Limit - (saved?.length ?? 0);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    const { error } = uid
      ? await supabase.from('mt5_setup_requests').insert({ user_id: uid, broker: broker.trim(), server: server.trim(), account_number: account.trim() })
      : { error: new Error('Please sign in.') };
    setBusy(false);
    if (error) { toast.error('Unable to save your MT5 details. Please try again.'); return; }
    setBroker(''); setServer(''); setAccount('');
    toast.success('MT5 details received — activation in progress.');
    qc.invalidateQueries({ queryKey: ['my-mt5-setup'] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('mt5_setup_requests').delete().eq('id', id);
    if (error) { toast.error('Unable to remove this account.'); return; }
    qc.invalidateQueries({ queryKey: ['my-mt5-setup'] });
  };

  return (
    <div className="space-y-4">
      <Card title="MT5 account setup">
        <p className="mb-3 font-semibold">{planName} · Up to {mt5Limit} MT5 account{mt5Limit === 1 ? '' : 's'}</p>
        <Badge className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Setup available</Badge>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your broker, MT5 server and account number below. Our team completes the secure activation on our side — we never ask for your broker password.
        </p>

        {remaining > 0 ? (
          <form onSubmit={save} className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="mt5-broker">Broker</Label>
              <Input id="mt5-broker" required maxLength={120} placeholder="e.g. Exness" value={broker} onChange={e => setBroker(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt5-server">MT5 server</Label>
              <Input id="mt5-server" required maxLength={120} placeholder="e.g. Exness-MT5Real" value={server} onChange={e => setServer(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mt5-account">Account number</Label>
              <Input id="mt5-account" inputMode="numeric" pattern="[0-9]+" required maxLength={30} value={account} onChange={e => setAccount(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
              <Button type="submit" disabled={busy}><Link2 className="h-4 w-4" />{busy ? 'Saving…' : 'Submit MT5 details'}</Button>
              <span className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />No passwords collected</span>
            </div>
          </form>
        ) : (
          <p className="mt-5 border-t pt-5 text-sm text-muted-foreground">You’ve reached your plan’s limit of {mt5Limit} account{mt5Limit === 1 ? '' : 's'}. Remove one below to add another.</p>
        )}
      </Card>

      <Card title="Your MT5 accounts">
        {loadError && <p role="alert" className="text-sm">Unable to load saved accounts.</p>}
        {!loadError && (saved?.length ?? 0) === 0 && <p className="text-sm text-muted-foreground">No MT5 accounts added yet.</p>}
        <div className="space-y-3">
          {saved?.map(item => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
              <div>
                <p className="font-semibold">{item.broker} · {item.account_number}</p>
                <p className="text-sm text-muted-foreground">{item.server}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">Details received · Activation in progress</Badge>
                <Button size="icon" variant="ghost" aria-label="Remove saved account" onClick={() => remove(item.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Setup instructions">
        <ol className="list-decimal space-y-1 pl-5 text-sm">
          <li>Submit your broker, MT5 server and account number above.</li>
          <li>Our team activates the connection and confirms on Telegram.</li>
          <li>Run on a VPS for uninterrupted operation.</li>
        </ol>
      </Card>
    </div>
  );
}
