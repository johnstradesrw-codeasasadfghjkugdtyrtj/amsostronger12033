import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/site-chrome";

type Mode = "login" | "signup" | "forgot";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { mode?: Mode } => ({
    mode: s.mode === "signup" || s.mode === "forgot" ? s.mode : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Quantum Multi Assets Matrix" },
      { name: "description", content: "Create a free account or sign in to your dashboard." },
      { property: "og:title", content: "Sign in — Quantum Multi Assets Matrix" },
      { property: "og:description", content: "Create a free account or sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>(search.mode ?? "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => setMode(search.mode ?? "login"), [search.mode]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => data.user && navigate({ to: "/dashboard" }));
    const { data } = supabase.auth.onAuthStateChange((e) => {
      if (e === "SIGNED_IN") navigate({ to: "/dashboard" });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard`, data: { full_name: name } },
        });
        if (error) throw error;
        setSent("Check your email and click the confirmation link. You'll go straight to your dashboard.");
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        setSent("If that email has an account, a reset link is on its way.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">
          {mode === "signup" ? "Create your free account" : mode === "login" ? "Login to Dashboard" : "Reset password"}
        </h1>
        {sent ? (
          <p className="mt-6 rounded-lg bg-muted p-4 text-sm">{sent}</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <div><Label htmlFor="n">Full name</Label><Input id="n" value={name} onChange={(e) => setName(e.target.value)} required /></div>
            )}
            <div><Label htmlFor="e">Email</Label><Input id="e" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
            {mode !== "forgot" && (
              <div><Label htmlFor="p">Password</Label><Input id="p" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signup" ? "Create Free Account" : mode === "login" ? "Login" : "Send reset link"}
            </Button>
          </form>
        )}
        <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground">
          {mode !== "login" && <button className="text-left text-primary" onClick={() => { setSent(null); setMode("login"); }}>Already have an account? Login</button>}
          {mode !== "signup" && <button className="text-left text-primary" onClick={() => { setSent(null); setMode("signup"); }}>New here? Create a free account</button>}
          {mode === "login" && <button className="text-left" onClick={() => setMode("forgot")}>Forgot password?</button>}
          <Link to="/" className="mt-2">← Back to home</Link>
        </div>
      </div>
    </div>
  );
}
