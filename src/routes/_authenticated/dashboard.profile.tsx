import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHead, Card } from "@/components/dash-ui";
import { useAccount } from "@/hooks/use-account";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({ component: Profile });

function Profile() {
  const { data } = useAccount();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  useEffect(() => setName(data?.profile?.full_name ?? ""), [data?.profile?.full_name]);
  if (!data) return null;
  const save = async () => {
    const { error } = await supabase.from("profiles").update({ full_name: name }).eq("id", data.user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    qc.invalidateQueries({ queryKey: ["account"] });
  };
  return (
    <div className="max-w-xl space-y-4">
      <PageHead title="Profile" />
      <Card>
        <div className="space-y-3">
          <div><Label>Email</Label><Input value={data.user.email ?? ""} disabled /></div>
          <div><Label htmlFor="fn">Full name</Label><Input id="fn" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <p className="text-sm text-muted-foreground">Role: {data.isAdmin ? "Administrator" : "Customer"}</p>
          <Button onClick={save}>Save</Button>
        </div>
      </Card>
    </div>
  );
}
