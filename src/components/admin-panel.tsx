import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHead, Card } from "@/components/dash-ui";
import { Logo } from "@/components/site-chrome";
import { useAccount, statusLabel } from "@/hooks/use-account";
import { isSubscriptionActive } from "@/lib/site";
import { AdminUsers } from '@/components/admin-users';
import { AdminMt5 } from '@/components/admin-mt5';
import { MANAGED_PAGES } from '@/lib/maintenance';
import { useSitePages } from '@/components/maintenance-gate';

export function Admin({ section = "payments" }: { section?: string }) {
  const { data, isLoading } = useAccount();
  if (isLoading) return <p className="p-8 text-muted-foreground">Loading…</p>;
  if (!data?.isAdmin)
    return (
      <div className="p-8">
        <p>You don't have access to the admin area.</p>
        <Link to="/dashboard" className="text-primary">Back to dashboard</Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="mb-6 flex items-center justify-between"><Logo /><Link to="/dashboard" className="text-sm text-primary">← Dashboard</Link></div>
      <PageHead title="Administrator" sub="Payment verification here is manual." />
      <Tabs key={section} defaultValue={section}>
        <TabsList className="h-auto flex-wrap justify-start gap-1">
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="mt5">MT5 setup</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="subs">Subscriptions</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="methods">Payment methods</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
        </TabsList>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="mt5"><AdminMt5 uid={data.user.id} /></TabsContent>
        <TabsContent value="settings"><Card title="Access settings"><p>Administrator roles are provisioned manually. Payment approval is required for paid access. The MT5 execution bridge is not configured.</p></Card></TabsContent>
        <TabsContent value="payments"><PaymentsAdmin /></TabsContent>
        <TabsContent value="subs"><SubsAdmin /></TabsContent>
        <TabsContent value="plans"><PlansAdmin /></TabsContent>
        <TabsContent value="methods"><MethodsAdmin uid={data.user.id} /></TabsContent>
        <TabsContent value="maintenance"><MaintenanceAdmin /></TabsContent>
        <TabsContent value="media"><AdminMedia uid={data.user.id} /></TabsContent>
      </Tabs>
    </div>
  );
}

function PaymentsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const [p, prof] = await Promise.all([
        supabase.from("payments").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("id,email"),
      ]);
      const emails = new Map((prof.data ?? []).map((x) => [x.id, x.email]));
      return (p.data ?? []).map((x) => ({ ...x, email: emails.get(x.user_id) }));
    },
  });
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const view = async (path: string) => {
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(path, 120);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  };
  const review = async (id: string, approve: boolean) => {
    if (!approve && !reasons[id]) { toast.error("Enter a rejection reason."); return; }
    const { error } = await supabase.rpc("review_payment", { _payment_id: id, _approve: approve, _reason: reasons[id] ?? "" });
    if (error) { toast.error(error.message); return; }
    toast.success(approve ? "Approved — subscription activated" : "Rejected");
    qc.invalidateQueries();
  };
  return (
    <div className="mt-4 space-y-3">
      {data?.length === 0 && <p className="text-muted-foreground">No payments yet.</p>}
      {data?.map((p) => (
        <Card key={p.id}>
          <div className="flex flex-wrap justify-between gap-2">
            <div className="text-sm">
              <p className="font-semibold">{p.email} · {p.plan_name} · ${Number(p.amount)}</p>
              <p className="text-muted-foreground">{p.reference} · {p.method_name} · tx: {p.tx_id || "—"} · from: {p.sender || "—"}</p>
              <p className="text-muted-foreground">Paid {p.paid_at ? new Date(p.paid_at).toLocaleString() : "—"} · Submitted {new Date(p.created_at).toLocaleString()}</p>
              {p.notes && <p className="mt-1">Note: {p.notes}</p>}
            </div>
            <Badge variant="outline">{statusLabel[p.status]}</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => view(p.screenshot_path)}>View screenshot</Button>
            {(p.status === "pending_review" || p.status === "under_verification") && (
              <>
                <Button size="sm" onClick={() => review(p.id, true)}>Approve</Button>
                <Input className="h-9 max-w-xs" placeholder="Rejection reason" value={reasons[p.id] ?? ""} onChange={(e) => setReasons({ ...reasons, [p.id]: e.target.value })} />
                <Button size="sm" variant="destructive" onClick={() => review(p.id, false)}>Reject</Button>
              </>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function SubsAdmin() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => (await supabase.from("subscriptions").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const revoke = async (id: string) => {
    const reason = prompt("Reason for revoking?") ?? "";
    const { error } = await supabase.from("subscriptions").update({ revoked: true, revoke_reason: reason }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries();
  };
  return (
    <div className="mt-4 space-y-2">
      {data?.length === 0 && <p className="text-muted-foreground">No subscriptions yet.</p>}
      {data?.map((s) => (
        <Card key={s.id}>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span>{s.plan_name} · {s.user_id.slice(0, 8)} · until {new Date(s.expires_at).toLocaleDateString()}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{s.revoked ? "Revoked" : isSubscriptionActive(s) ? "Active" : "Expired"}</Badge>
              {isSubscriptionActive(s) && <Button size="sm" variant="destructive" onClick={() => revoke(s.id)}>Revoke</Button>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function PlansAdmin() {
  const { data } = useQuery({
    queryKey: ["admin-plans"],
    queryFn: async () => (await supabase.from("plans").select("*").order("sort_order")).data ?? [],
  });
  return <div className="mt-4 space-y-3">{data?.map((p) => <PlanEditor key={p.id} plan={p} />)}</div>;
}

function PlanEditor({ plan }: { plan: Tables<"plans"> }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ ...plan, featuresText: plan.features.join("\n") });
  const save = async () => {
    const { featuresText, id, created_at, ...rest } = f;
    void created_at;
    const { error } = await supabase.from("plans").update({
      ...rest, price: rest.price === null ? null : Number(rest.price),
      features: featuresText.split("\n").map((s) => s.trim()).filter(Boolean),
    }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Plan saved (applies to new purchases only)");
    qc.invalidateQueries({ queryKey: ["plans"] });
  };
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="sm:col-span-2"><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Price</Label><Input type="number" value={f.price ?? ""} disabled={f.custom_quote} onChange={(e) => setF({ ...f, price: e.target.value === "" ? null : Number(e.target.value) })} /></div>
        <div><Label>Currency</Label><Input value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value })} /></div>
        <div><Label>Days</Label><Input type="number" value={f.duration_days ?? ""} disabled={f.custom_quote} onChange={(e) => setF({ ...f, duration_days: e.target.value === "" ? null : Number(e.target.value) })} /></div>
        <div><Label>MT5 limit</Label><Input type="number" value={f.mt5_limit} onChange={(e) => setF({ ...f, mt5_limit: Number(e.target.value) })} /></div>
        <div><Label>Support level</Label><Input value={f.support_level ?? ""} onChange={(e) => setF({ ...f, support_level: e.target.value })} /></div>
        <div><Label>Order</Label><Input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></div>
        <div className="sm:col-span-2"><Label>Description</Label><Textarea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
        <div className="sm:col-span-2"><Label>Features (one per line)</Label><Textarea value={f.featuresText} onChange={(e) => setF({ ...f, featuresText: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
        {(["featured", "active", "visible"] as const).map((k) => (
          <label key={k} className="flex items-center gap-2"><Switch checked={f[k]} onCheckedChange={(v) => setF({ ...f, [k]: v })} />{k}</label>
        ))}
        <Button size="sm" onClick={save}>Save plan</Button>
      </div>
    </Card>
  );
}

function MethodsAdmin({ uid }: { uid: string }) {
  const { data } = useQuery({
    queryKey: ["admin-methods"],
    queryFn: async () => (await supabase.from("payment_methods").select("*").order("sort_order")).data ?? [],
  });
  return <div className="mt-4 space-y-3">{data?.map((m) => <MethodEditor key={m.id} m={m} uid={uid} />)}</div>;
}

function MethodEditor({ m, uid }: { m: Tables<"payment_methods">; uid: string }) {
  const qc = useQueryClient();
  const [f, setF] = useState(m);
  const save = async () => {
    if (f.address !== m.address && m.enabled && !confirm(`Change the LIVE receiving address for ${m.name}?\n\nOld: ${m.address}\nNew: ${f.address}`)) return;
    const { error } = await supabase.from("payment_methods").update({
      name: f.name, network: f.network, address: f.address || null, instructions: f.instructions,
      network_warning: f.network_warning, qr_image_url: f.qr_image_url, enabled: f.enabled, sort_order: f.sort_order, updated_at: new Date().toISOString(),
    }).eq("id", f.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from("admin_audit").insert({ actor: uid, action: "payment_method_update", details: { id: f.id, old_address: m.address, new_address: f.address, enabled: f.enabled } });
    toast.success("Payment method saved");
    qc.invalidateQueries();
  };
  return (
    <Card>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><Label>Network</Label><Input value={f.network ?? ""} onChange={(e) => setF({ ...f, network: e.target.value })} /></div>
        <div><Label>Order</Label><Input type="number" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: Number(e.target.value) })} /></div>
        <div className="sm:col-span-3"><Label>Receiving address / merchant ID</Label><Input className="font-mono" value={f.address ?? ""} onChange={(e) => setF({ ...f, address: e.target.value })} placeholder="Not configured" /></div>
        <div className="sm:col-span-3"><Label>Instructions</Label><Textarea value={f.instructions ?? ""} onChange={(e) => setF({ ...f, instructions: e.target.value })} /></div>
        <div className="sm:col-span-3">
          <Label>Payment QR code</Label>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            {f.qr_image_url && <img src={f.qr_image_url} alt="QR code" className="h-24 w-24 rounded-lg border bg-card object-contain p-1" />}
            <Input type="file" accept="image/png,image/jpeg,image/webp" className="max-w-xs" onChange={(e) => {
              const file = e.target.files?.[0]; if (!file) return;
              if (file.size > 500_000) { toast.error("QR image must be under 500KB"); return; }
              const r = new FileReader(); r.onload = () => setF({ ...f, qr_image_url: String(r.result) }); r.readAsDataURL(file);
            }} />
            {f.qr_image_url && <Button size="sm" variant="outline" onClick={() => setF({ ...f, qr_image_url: null })}>Remove QR</Button>}
          </div>
        </div>
        <div className="sm:col-span-3"><Label>Network warning</Label><Input value={f.network_warning ?? ""} onChange={(e) => setF({ ...f, network_warning: e.target.value })} /></div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-sm">
        <label className="flex items-center gap-2"><Switch checked={f.enabled} onCheckedChange={(v) => setF({ ...f, enabled: v })} />Enabled</label>
        {!f.address && !f.qr_image_url && <Badge variant="outline">Not Configured</Badge>}
        <Button size="sm" onClick={save}>Save method</Button>
      </div>
    </Card>
  );
}


function AdminMedia({ uid }: { uid: string }) {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const { data: files } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const { data, error } = await supabase.storage.from("site-media").list(uid, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
      if (error) throw error;
      return (data ?? []).filter((f) => f.name !== ".emptyFolderPlaceholder");
    },
  });
  const upload = async (file: File) => {
    if (file.size > 50_000_000) { toast.error("File must be under 50MB"); return; }
    setUploading(true);
    const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const { error } = await supabase.storage.from("site-media").upload(path, file);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  };
  const view = async (name: string) => {
    const { data, error } = await supabase.storage.from("site-media").createSignedUrl(`${uid}/${name}`, 300);
    if (error) { toast.error(error.message); return; }
    window.open(data.signedUrl, "_blank");
  };
  const remove = async (name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    const { error } = await supabase.storage.from("site-media").remove([`${uid}/${name}`]);
    if (error) { toast.error(error.message); return; }
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-media"] });
  };
  return (
    <Card title="Site media">
      <p className="mb-3 text-sm text-muted-foreground">Upload photos and videos (up to 50MB each). Only admins can add or remove files.</p>
      <Input type="file" accept="image/*,video/*" className="max-w-xs" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) void upload(f); e.target.value = ""; }} />
      <div className="mt-4 divide-y divide-border">
        {files?.length === 0 && <p className="py-3 text-sm text-muted-foreground">No files uploaded yet.</p>}
        {files?.map((f) => (
          <div key={f.name} className="flex items-center justify-between gap-3 py-3">
            <p className="truncate text-sm font-medium">{f.name}</p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => view(f.name)}>View</Button>
              <Button size="sm" variant="destructive" onClick={() => remove(f.name)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function MaintenanceAdmin() {
  const qc = useQueryClient();
  const { data: pages } = useSitePages();
  const [msg, setMsg] = useState("");
  const toggle = async (path: string, enabled: boolean) => {
    const { error } = await supabase.from("site_pages").upsert({ path, enabled, message: enabled ? null : msg || null, updated_at: new Date().toISOString() });
    if (error) { toast.error(error.message); return; }
    toast.success(enabled ? "Page is live" : "Page is now in maintenance");
    qc.invalidateQueries({ queryKey: ["site-pages"] });
  };
  return (
    <Card title="Page maintenance">
      <p className="mb-3 text-sm text-muted-foreground">Turn a page off to show visitors a maintenance screen. Admins always see every page.</p>
      <Label>Maintenance message (optional)</Label>
      <Input className="mb-4" value={msg} onChange={(e) => setMsg(e.target.value)} placeholder="We are improving this page. Back soon." />
      <div className="divide-y divide-border">
        {MANAGED_PAGES.map((p) => {
          const on = pages?.find((x) => x.path === p.path)?.enabled ?? true;
          return (
            <div key={p.path} className="flex items-center justify-between gap-3 py-3">
              <div><p className="font-medium">{p.label}</p><p className="font-mono text-xs text-muted-foreground">{p.path}</p></div>
              <div className="flex items-center gap-3">
                <Badge variant={on ? "default" : "destructive"}>{on ? "Live" : "Maintenance"}</Badge>
                <Switch checked={on} onCheckedChange={(v) => toggle(p.path, v)} aria-label={`Toggle ${p.label}`} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
