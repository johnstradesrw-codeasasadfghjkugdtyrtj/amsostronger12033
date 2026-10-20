import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHead, Card } from "@/components/dash-ui";
import { validateProof, SUPPORT_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/pay/$planId")({ component: Pay });

function Pay() {
  const { planId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["checkout", planId],
    queryFn: async () => {
      const [plan, methods] = await Promise.all([
        supabase.from("plans").select("*").eq("id", planId).maybeSingle(),
        supabase.from("payment_methods").select("*").order("sort_order"),
      ]);
      return { plan: plan.data, methods: methods.data ?? [] };
    },
  });
  const [methodId, setMethodId] = useState("");
  const [tx, setTx] = useState("");
  const [sender, setSender] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; amount: number; created_at: string } | null>(null);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const plan = data?.plan;
  if (!plan || plan.custom_quote) return <Card><p>This plan isn't available for checkout.</p></Card>;
  const usable = (m: { enabled: boolean; address: string | null }) => m.enabled && !!m.address;
  const method = data!.methods.find((m) => m.id === methodId);

  const onFile = (f: File | null) => {
    if (!f) return;
    const err = validateProof(f);
    if (err) { toast.error(err); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!method || !usable(method)) { toast.error("Choose a configured payment method."); return; }
    if (!file) { toast.error("Payment screenshot is required."); return; }
    if (!confirm) { toast.error("Please confirm your payment information."); return; }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const path = `${uid}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: row, error } = await supabase.from("payments").insert({
        user_id: uid, plan_id: plan.id, plan_name: plan.name, amount: Number(plan.price), duration_days: plan.duration_days!,
        method_id: method.id, method_name: method.name, tx_id: tx || null, sender: sender || null,
        paid_at: paidAt ? new Date(paidAt).toISOString() : null, notes: notes || null, screenshot_path: path,
      }).select("reference, amount, created_at").single();
      if (error) throw error.code === "23505" ? new Error("This transaction ID has already been submitted.") : error;
      setDone(row);
      qc.invalidateQueries({ queryKey: ["account"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <Card>
        <CheckCircle2 className="h-10 w-10 text-primary" />
        <h2 className="mt-3 font-display text-2xl font-bold">Payment submitted successfully</h2>
        <p className="mt-2 text-muted-foreground">Your payment is awaiting administrator verification. Your paid subscription features will remain locked until approval. Your free resources stay available.</p>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <dt className="text-muted-foreground">Reference</dt><dd>{done.reference}</dd>
          <dt className="text-muted-foreground">Plan</dt><dd>{plan.name}</dd>
          <dt className="text-muted-foreground">Amount</dt><dd>${Number(done.amount)} {plan.currency}</dd>
          <dt className="text-muted-foreground">Submitted</dt><dd>{new Date(done.created_at).toLocaleString()}</dd>
          <dt className="text-muted-foreground">Status</dt><dd>Pending Review</dd>
        </dl>
        <div className="mt-4 flex gap-2">
          <Button asChild><Link to="/dashboard/payments">View payment status</Link></Button>
          <Button asChild variant="outline"><a href={SUPPORT_URL} target="_blank" rel="noreferrer">Support</a></Button>
        </div>
      </Card>
    );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHead title="Submit payment" sub="A payment screenshot is required for every purchase or renewal." />
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Payment method</Label>
            <div className="mt-2 grid gap-2 sm:grid-cols-3">
              {data!.methods.map((m) => (
                <button type="button" key={m.id} disabled={!usable(m)} onClick={() => setMethodId(m.id)}
                  className={`rounded-xl border p-3 text-left text-sm disabled:opacity-50 ${methodId === m.id ? "border-primary" : "border-border"}`}>
                  <p className="font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">{usable(m) ? m.network : "Not Configured"}</p>
                </button>
              ))}
            </div>
          </div>
          {method && (
            <Card title="Payment destination">
              <p className="break-all font-mono text-sm">{method.address}</p>
              {method.instructions && <p className="mt-2 text-sm text-muted-foreground">{method.instructions}</p>}
              {method.network_warning && <p className="mt-3 flex gap-2 text-sm text-destructive"><AlertTriangle className="h-4 w-4 shrink-0" />{method.network_warning}</p>}
              <p className="mt-2 text-xs text-muted-foreground">Verification is manual. Never share seed phrases, private keys or passwords.</p>
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label htmlFor="tx">Transaction ID / hash</Label><Input id="tx" value={tx} onChange={(e) => setTx(e.target.value)} /></div>
            <div><Label htmlFor="snd">Sender wallet / account</Label><Input id="snd" value={sender} onChange={(e) => setSender(e.target.value)} /></div>
            <div><Label htmlFor="pa">Date & time of payment</Label><Input id="pa" type="datetime-local" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} required /></div>
          </div>
          <div>
            <Label htmlFor="ss">Payment screenshot (required — JPG, PNG, WebP, max 5 MB)</Label>
            <Input id="ss" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            {preview && <img src={preview} alt="Payment screenshot preview" className="mt-3 max-h-64 rounded-lg border border-border" />}
          </div>
          <div><Label htmlFor="nt">Notes (optional)</Label><Textarea id="nt" value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={confirm} onCheckedChange={(v) => setConfirm(!!v)} />
            I confirm that the payment information I submitted is accurate.
          </label>
          <Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit payment"}</Button>
        </form>
      </div>
      <Card title="Checkout summary">
        <p className="font-display text-xl font-bold">{plan.name}</p>
        <p className="font-display text-3xl font-bold text-primary">${Number(plan.price)} <span className="text-sm text-muted-foreground">{plan.currency}</span></p>
        <p className="text-sm text-muted-foreground">{plan.duration_days} days</p>
        <ul className="mt-3 list-disc pl-5 text-sm">{plan.features.map((f) => <li key={f}>{f}</li>)}</ul>
      </Card>
    </div>
  );
}
