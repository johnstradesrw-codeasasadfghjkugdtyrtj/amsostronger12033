import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHead, Card } from "@/components/dash-ui";
import { useProtectedFeature } from '@/hooks/use-entitlement';
import { pageHead } from '@/lib/metadata';
import { supabase } from '@/integrations/supabase/client';
import { BROKERS, searchBrokers } from '@/lib/brokers';
import { Link2, ShieldCheck, Trash2, CheckCircle2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute("/_authenticated/dashboard/mt5")({ head: () => pageHead('Connect MT5','Secure subscription-based MT5 account access.'), component: Mt5 });

function Mt5() {
  const { data } = useProtectedFeature('mt5');
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) return false;
      const r = await supabase.rpc('has_role', { _user_id: uid, _role: 'admin' });
      return !!r.data;
    },
    staleTime: 60000,
  });
  const allowed = !!isAdmin;
  return (
    <div>
      <PageHead title="Connect MT5" />
      <Mt5Setup planName={allowed ? data?.entitlement.plan_name ?? null : null} mt5Limit={allowed ? Math.max(data?.entitlement.mt5_limit ?? 0, 10) : 1} allowed={allowed} />
    </div>
  );
}

function BrokerPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const matches = searchBrokers(value);
  return (
    <div className="relative space-y-2" ref={boxRef}>
      <Label htmlFor="mt5-broker">Broker</Label>
      <div className="relative">
        <Input
          id="mt5-broker"
          required
          maxLength={120}
          placeholder="Search your broker…"
          value={value}
          autoComplete="off"
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {open && matches.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover py-1 shadow-lg" role="listbox">
          {matches.map((b) => (
            <li key={b}>
              <button
                type="button"
                role="option"
                aria-selected={value === b}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => { e.preventDefault(); onChange(b); setOpen(false); }}
              >
                {b}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{BROKERS.length}+ brokers supported — yours not listed? Just type its name.</p>
    </div>
  );
}

function Mt5Setup({ planName, mt5Limit, allowed }: { planName: string | null; mt5Limit: number; allowed: boolean }) {
  const qc = useQueryClient();
  const [broker, setBroker] = useState('');
  const [server, setServer] = useState('');
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [failed, setFailed] = useState(false);

  const { data: saved, error: loadError } = useQuery({
    queryKey: ['my-mt5-setup'],
    queryFn: async () => {
      const result = await supabase.from('mt5_setup_requests').select('id, broker, server, account_number, created_at').order('created_at', { ascending: false });
      if (result.error) throw result.error;
      return result.data;
    },
    staleTime: 30000,
  });

  const remaining = mt5Limit - (saved?.length ?? 0);

  const next = (event: React.FormEvent) => {
    event.preventDefault();
    if (step < 3) { setStep(step + 1); return; }
    void save();
  };

  const save = async () => {
    if (!allowed) { setFailed(true); return; }
    setBusy(true);
    const { data: s } = await supabase.auth.getSession();
    const uid = s.session?.user.id;
    const { error } = uid
      ? await supabase.from('mt5_setup_requests').insert({ user_id: uid, broker: broker.trim(), server: server.trim(), account_number: account.trim(), account_password: password })
      : { error: new Error('Please sign in.') };
    setBusy(false);
    if (error) { setFailed(true); return; }
    setBroker(''); setServer(''); setAccount(''); setPassword(''); setStep(0);
    toast.success('✅ MT5 connected successfully!', { description: `${broker} · ${account}` });
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
        {planName && <p className="mb-3 font-semibold">{planName} · Up to {mt5Limit} MT5 account{mt5Limit === 1 ? '' : 's'}</p>}
        <Badge className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" />Setup available</Badge>
        <p className="mt-3 text-sm text-muted-foreground">
          Pick your broker, then enter your MT5 server, account number and password. Our team completes the secure activation on our side.
        </p>

        {failed ? (
          <div role="alert" className="mt-5 space-y-3 rounded-lg border-2 border-destructive bg-destructive/10 p-5 text-center">
            <p className="text-lg font-bold text-destructive">⚠️ Connection failed</p>
            <p className="font-semibold">No active paid plan</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild><Link to="/dashboard/plans">View plans</Link></Button>
              <Button variant="outline" onClick={() => { setFailed(false); setStep(0); }}>Try again</Button>
            </div>
          </div>
        ) : remaining > 0 || !allowed ? (
          <form onSubmit={next} className="mt-5 space-y-4 border-t pt-5">
            <p className="text-xs font-semibold text-muted-foreground">Step {step + 1} of 4</p>
            {step === 0 && <BrokerPicker value={broker} onChange={setBroker} />}
            {step === 1 && (
              <div className="space-y-2">
                <Label htmlFor="mt5-server">MT5 server</Label>
                <Input id="mt5-server" autoFocus required maxLength={120} placeholder="e.g. Exness-MT5Real" value={server} onChange={e => setServer(e.target.value)} />
              </div>
            )}
            {step === 2 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="mt5-account">Account number</Label>
                  <Input id="mt5-account" autoFocus inputMode="numeric" pattern="[0-9]+" required maxLength={30} value={account} onChange={e => setAccount(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mt5-password">Account password</Label>
                  <Input id="mt5-password" type="password" required maxLength={120} value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </>
            )}
            {step === 3 && (
              <div className="rounded-lg border bg-card p-4 text-sm">
                <p><b>Broker:</b> {broker}</p>
                <p><b>Server:</b> {server}</p>
                <p><b>Account:</b> {account}</p>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {step > 0 && <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Back</Button>}
              <Button type="submit" disabled={busy || (step === 0 && !broker.trim())}>
                <Link2 className="h-4 w-4" />{step < 3 ? 'Continue' : busy ? 'Connecting…' : 'Confirm connection'}
              </Button>
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
          <li>Pick your broker and submit your MT5 server, account number and password above.</li>
          <li>Our team activates the connection and confirms on Telegram.</li>
          <li>Run on a VPS for uninterrupted operation.</li>
        </ol>
      </Card>
    </div>
  );
}
