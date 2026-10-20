import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, CreditCard, Receipt, Bot, UserCircle, LifeBuoy, Users, LogOut, ShieldCheck, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site-chrome";
import { useAccount } from "@/hooks/use-account";
import { ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Quantum Multi Assets Matrix" }, { name: "robots", content: "noindex" }] }),
  component: DashboardLayout,
});

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/dashboard/plans", label: "Subscribe", icon: CreditCard },
  { to: "/dashboard/payments", label: "Payments", icon: Receipt },
  { to: "/dashboard/bot", label: "Bot", icon: Bot },
  { to: "/dashboard/profile", label: "Profile", icon: UserCircle },
] as const;

function DashboardLayout() {
  const { data } = useAccount();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const linkCls = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-foreground";

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:flex lg:flex-col">
        <div className="mb-8"><Logo /></div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className={linkCls} activeProps={{ className: "bg-sidebar-accent text-primary" }} activeOptions={{ exact: true }}>
              <i.icon className="h-4 w-4" />{i.label}
            </Link>
          ))}
          <Link to="/dashboard/mt5" className={linkCls} activeProps={{ className: "bg-sidebar-accent text-primary" }}><Link2 className="h-4 w-4" />Connect MT5</Link>
          <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer" className={linkCls}><Users className="h-4 w-4" />Account Management</a>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className={linkCls}><LifeBuoy className="h-4 w-4" />Support</a>
          {data?.isAdmin && <Link to="/admin" className={`${linkCls} text-accent`}><ShieldCheck className="h-4 w-4" />Admin</Link>}
        </nav>
        <button onClick={signOut} className={linkCls}><LogOut className="h-4 w-4" />Logout</button>
      </aside>

      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          {data?.isAdmin && <Link to="/admin" className="rounded-full p-2 text-accent" aria-label="Admin"><ShieldCheck className="h-5 w-5" /></Link>}
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="rounded-full p-2 text-muted-foreground" aria-label="Support"><LifeBuoy className="h-5 w-5" /></a>
          <button onClick={signOut} className="rounded-full p-2 text-muted-foreground" aria-label="Logout"><LogOut className="h-5 w-5" /></button>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24 sm:p-8 lg:pb-8"><Outlet /></main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="flex flex-col items-center gap-1 py-2 text-[11px] text-muted-foreground" activeProps={{ className: "text-primary" }} activeOptions={{ exact: true }}>
            <i.icon className="h-5 w-5" />{i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
