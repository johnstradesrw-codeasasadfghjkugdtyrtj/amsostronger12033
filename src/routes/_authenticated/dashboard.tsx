import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LayoutDashboard, CreditCard, Receipt, Link2, Bot, BookOpen, UserCircle, LifeBuoy, Users, LogOut, ShieldCheck, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site-chrome";
import { useAccount } from "@/hooks/use-account";
import { ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Quantum Multi Assets Matrix" }, { name: "robots", content: "noindex" }] }),
  component: DashboardLayout,
});

const items = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/resources", label: "Resources & Guides", icon: BookOpen },
  { to: "/dashboard/subscription", label: "My Subscription", icon: CreditCard },
  { to: "/dashboard/payments", label: "Payment History", icon: Receipt },
  { to: "/dashboard/mt5", label: "Connect MT5", icon: Link2 },
  { to: "/dashboard/bot", label: "Bot Dashboard", icon: Bot },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
] as const;

function DashboardLayout() {
  const { data } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const linkCls = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground";
  const nav = (
    <nav className="flex flex-col gap-1">
      {items.map((i) => (
        <Link key={i.to} to={i.to} onClick={() => setOpen(false)} className={linkCls} activeProps={{ className: "bg-sidebar-accent text-foreground" }} activeOptions={{ exact: true }}>
          <i.icon className="h-4 w-4" />{i.label}
        </Link>
      ))}
      <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer" className={linkCls}><Users className="h-4 w-4" />Account Management</a>
      <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className={linkCls}><LifeBuoy className="h-4 w-4" />Support</a>
      {data?.isAdmin && (
        <Link to="/admin" className={`${linkCls} text-primary`}><ShieldCheck className="h-4 w-4" />Admin</Link>
      )}
      <button onClick={signOut} className={linkCls}><LogOut className="h-4 w-4" />Logout</button>
    </nav>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:block">
        <div className="mb-8"><Logo /></div>
        {nav}
      </aside>
      <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(!open)} aria-label="Menu"><Menu /></button>
      </div>
      {open && <div className="border-b border-border bg-sidebar p-4 lg:hidden">{nav}</div>}
      <main className="flex-1 p-4 sm:p-8"><Outlet /></main>
    </div>
  );
}
