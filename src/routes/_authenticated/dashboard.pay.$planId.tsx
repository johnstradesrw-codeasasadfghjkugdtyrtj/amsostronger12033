import { pageHead } from '@/lib/metadata';
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Copy, ImagePlus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/dash-ui";
import { validateProof } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard/pay/$planId")({ head: () => pageHead('Submit payment','Submit a payment screenshot for administrator verification.'), component: Pay });

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
      return { plan: plan.data, methods: (methods.data ?? []).filter((m) => m.enabled && !!m.address) };
    },
  });
  const [methodId, setMethodId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!methodId && data?.methods[0]) setMethodId(data.methods[0].id);
  }, [data, methodId]);

  if (isLoading) return <p className="text-muted-foreground">Loading…</p>;
  const plan = data?.plan;
  if (!plan || plan.custom_quote) return <Card><p>This plan isn't available.</p></Card>;
  const method = data?.methods.find((m) => m.id === methodId);

  const onFile = (f: File | null) => {
    if (!f) return;
    const err = validateProof(f);
    if (err) { toast.error(err); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!method) { toast.error("No payment method available yet."); return; }
    if (!file) { toast.error("Please add your payment screenshot."); return; }
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('Please sign in.');
      const uid = u.user.id;
      const path = `${uid}/${crypto.randomUUID()}.${file.name.split(".").pop()}`;
      const up = await supabase.storage.from("payment-proofs").upload(path, file, { contentType: file.type });
      if (up.error) throw up.error;
      const { data: row, error } = await supabase.from("payments").insert({
        user_id: uid, plan_id: plan.id, plan_name: plan.name, amount: Number(plan.price), duration_days: plan.duration_days ?? 0,
        method_id: method.id, method_name: method.name, screenshot_path: path,
      }).select("reference").single();
      if (error) throw error;
      setDone(row.reference);
      qc.invalidateQueries({ queryKey: ["account"] });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (done)
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
        <h2 className="mt-3 font-display text-2xl font-bold">Payment sent</h2>
        <p className="mt-2 text-sm text-muted-foreground">We'll review it shortly. Reference <span className="font-mono text-foreground">{done}</span></p>
        <Button asChild className="mt-5 w-full"><Link to="/dashboard">Back to dashboard</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-md space-y-4">
      <Link to="/dashboard/plans" className="inline-flex items-center gap-1 text-sm text-muted-foreground"><ArrowLeft className="h-4 w-4" />Plans</Link>

      <div className="rounded-2xl bg-[image:var(--gradient-brand)] p-5 text-primary-foreground">
        <p className="text-sm opacity-80">{plan.name} · {plan.duration_days} days</p>
        <p className="font-display text-4xl font-bold">${Number(plan.price)}</p>
      </div>

      {!data?.methods.length ? (
        <Card><p className="text-sm">Payment addresses aren't set up yet. Please contact support.</p></Card>
      ) : (
        <>
          <div className="flex gap-2 overflow-x-auto">
            {data?.methods.map((m) => (
              <button key={m.id} onClick={() => setMethodId(m.id)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm ${methodId === m.id ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground"}`}>
                {m.name}
              </button>
            ))}
          </div>
          {method && (
            <Card title={`Send to (${method.network ?? method.asset})`}>
              <button onClick={() => { navigator.clipboard.writeText(method.address ?? ''); toast.success("Address copied"); }}
                className="flex w-full items-center gap-2 rounded-lg bg-muted p-3 text-left">
                <span className="min-w-0 flex-1 break-all font-mono text-sm">{method.address}</span>
                <Copy className="h-4 w-4 shrink-0 text-primary" />
              </button>
              {method.network_warning && <p className="mt-2 text-xs text-accent">{method.network_warning}</p>}
            </Card>
          )}

          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-card p-6 text-center hover:border-primary">
            {preview ? (
              <img src={preview} alt="Payment screenshot" className="max-h-64 rounded-lg" />
            ) : (
              <>
                <ImagePlus className="h-8 w-8 text-primary" />
                <span className="text-sm">Add payment screenshot</span>
              </>
            )}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
          </label>

          <Button size="lg" className="w-full" disabled={busy || !file} onClick={submit}>
            {busy ? "Sending…" : "Submit payment"}
          </Button>
        </>
      )}
    </div>
  );
}
