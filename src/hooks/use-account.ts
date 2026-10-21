import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEntitlement } from './use-entitlement';

export function useAccount() {
  const entitlement = useEntitlement();
  const account = useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('Please sign in.');
      const uid = u.user.id;
      const [subs, pays, roles, prof] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", uid).order("expires_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      ]);
      const subscriptions = subs.data ?? [];
      for (const result of [subs, pays, roles, prof]) if (result.error) throw result.error;
      return {
        user: u.user,
        profile: prof.data,
        subscriptions,
        payments: pays.data ?? [],
        latest: subscriptions[0] ?? null,
        isAdmin: !!roles.data?.some((r) => r.role === "admin"),
      };
    },
  });
  return { ...account, isLoading: account.isLoading || entitlement.isLoading, data: account.data ? { ...account.data, entitlement: entitlement.data, active: entitlement.data?.allowed ? account.data.subscriptions.find(s => s.id === entitlement.data?.subscription_id) ?? null : null } : undefined };
}

export const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  under_verification: "Under Verification",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
