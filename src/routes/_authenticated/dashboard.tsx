import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Home, CreditCard, Receipt, Bot, UserCircle, LifeBuoy, Users, LogOut, ShieldCheck, Link2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/site-chrome";
import { useAccount } from "@/hooks/use-account";
import { ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/metadata';

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => pageHead('Dashboard','Your account, subscriptions and MT5 access.'),
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

  const linkCls = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-foreground";

  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar p-4 lg:flex lg:flex-col">
        <div className="mb-8"><Logo /></div>
        <nav className="flex flex-1 flex-col gap-1">
          {items.map((i) => (
            <Link key={i.to} to={i.to} className={linkCls} activeProps={{ className: "bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20" }} activeOptions={{ exact: true }}>
              <i.icon className="h-4 w-4" />{i.label}
            </Link>
          ))}
          <Button asChild className="my-3 justify-start rounded-xl shadow-md"><Link to="/dashboard/mt5"><Link2 className="h-4 w-4" />Connect MT5</Link></Button>
          <Link to="/resources" className={linkCls}><LifeBuoy className="h-4 w-4" />Resources & Guides</Link>
          <Link to="/dashboard/subscription" className={linkCls}><Receipt className="h-4 w-4" />My Subscription</Link>
          <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer" className={linkCls}><Users className="h-4 w-4" />Account Management</a>
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className={linkCls}><LifeBuoy className="h-4 w-4" />Support</a>
          {data?.isAdmin && <Link to="/admin" className={`${linkCls} text-accent`}><ShieldCheck className="h-4 w-4" />Admin</Link>}
        </nav>
        <Button variant="ghost" onClick={signOut} className={linkCls}><LogOut className="h-4 w-4" />Logout</Button>
      </aside>

      <header className="sticky top-0 z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          {data?.isAdmin && <Link to="/admin" className="rounded-full p-2 text-accent" aria-label="Admin"><ShieldCheck className="h-5 w-5" /></Link>}
          <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="rounded-full p-2 text-muted-foreground" aria-label="Support"><LifeBuoy className="h-5 w-5" /></a>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Logout"><LogOut className="h-5 w-5" /></Button>
        </div>
      </header>

      <main className="min-w-0 flex-1 p-4 pb-24 sm:p-8 lg:pb-8"><div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-300">
        <nav className="mb-5 flex flex-wrap gap-x-4 gap-y-2 border-b border-border pb-3 text-sm lg:hidden">
          <Link to="/dashboard/mt5" className="font-semibold text-primary">Connect MT5</Link>
          <Link to="/resources">Resources</Link>
          <Link to="/dashboard/subscription">My Subscription</Link>
          <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer">Account Management</a>
        </nav>
        <Outlet />
      </div></main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-sidebar/95 backdrop-blur lg:hidden">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="mx-1 my-1 flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-medium text-muted-foreground transition-colors" activeProps={{ className: "bg-primary/10 text-primary" }} activeOptions={{ exact: true }}>
            <i.icon className="h-5 w-5" />{i.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
