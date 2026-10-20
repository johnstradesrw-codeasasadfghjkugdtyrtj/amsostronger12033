import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set new password — Quantum Multi Assets Matrix" },
      { name: "description", content: "Choose a new password for your account." },
      { property: "og:title", content: "Set new password" },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Reset,
});

function Reset() {
  const [pw, setPw] = useState("");
  const navigate = useNavigate();
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/dashboard" });
  };
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={save} className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <div><Label htmlFor="pw">New password</Label><Input id="pw" type="password" minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} required /></div>
        <Button type="submit" className="w-full">Save password</Button>
      </form>
    </div>
  );
}
