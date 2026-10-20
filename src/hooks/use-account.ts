import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { isSubscriptionActive } from "@/lib/site";

export function useAccount() {
  return useQuery({
    queryKey: ["account"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const [subs, pays, roles, prof] = await Promise.all([
        supabase.from("subscriptions").select("*").eq("user_id", uid).order("expires_at", { ascending: false }),
        supabase.from("payments").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
        supabase.from("user_roles").select("role").eq("user_id", uid),
        supabase.from("profiles").select("*").eq("id", uid).maybeSingle(),
      ]);
      const subscriptions = subs.data ?? [];
      const active = subscriptions.find((s) => isSubscriptionActive(s)) ?? null;
      return {
        user: u.user!,
        profile: prof.data,
        subscriptions,
        payments: pays.data ?? [],
        active,
        latest: subscriptions[0] ?? null,
        isAdmin: !!roles.data?.some((r) => r.role === "admin"),
      };
    },
  });
}

export const statusLabel: Record<string, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  under_verification: "Under Verification",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
