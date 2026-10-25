import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ACCOUNT_MGMT_URL, SUPPORT_URL } from "@/lib/site";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden>
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect x="3" y="3" width="26" height="26" rx="6" fill="none" stroke="url(#lg)" strokeWidth="2" />
        <path d="M9 9h6v6H9zM17 17h6v6h-6zM17 9h6v6h-6z" fill="url(#lg)" />
      </svg>
      <span className="font-display text-xs font-bold leading-tight tracking-widest sm:text-sm">
        QUANTUM MULTI
        <br />
        ASSETS MATRIX
      </span>
    </Link>
  );
}

const nav = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/pricing", label: "Pricing" },
  { to: "/get-bot-file", label: "Get Bot File 🗃️" },
  { to: "/faq", label: "FAQ" },
] as const;

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const links = (
    <>
      {nav.map((n) => (
        <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="text-sm text-muted-foreground hover:text-foreground" activeProps={{ className: "text-foreground" }} activeOptions={{ exact: true }}>
          {n.label}
        </Link>
      ))}
      <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Account Management</a>
      <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground">Support</a>
    </>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="hidden items-center gap-4 xl:flex">{links}</nav>
        <div className="hidden items-center gap-2 xl:flex">
          <Button variant="secondary" asChild><Link to="/dashboard/mt5"><Link2 className="h-4 w-4" />Connect MT5</Link></Button>
          {user ? (
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button variant="ghost" asChild><Link to="/auth">Login</Link></Button>
              <Button asChild><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 xl:hidden"><Button size="sm" variant="secondary" asChild><Link to="/dashboard/mt5"><Link2 className="h-4 w-4" />MT5</Link></Button><Button size="icon" variant="ghost" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>{open ? <X /> : <Menu />}</Button></div>
      </div>
      {open && (
        <div className="flex flex-col gap-4 border-t border-border px-4 py-4 xl:hidden">
          {links}
          {user ? (
            <Button asChild><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1"><Link to="/auth">Login</Link></Button>
              <Button asChild className="flex-1"><Link to="/auth" search={{ mode: "signup" }}>Get Started</Link></Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <Logo />
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={ACCOUNT_MGMT_URL} target="_blank" rel="noreferrer" className="text-primary">Account Management — Click Here</a>
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="text-primary">Contact Support on Telegram</a>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Quantum Multi Assets Matrix · Matrix Quantum MT5 · Botorian Dev Forex</p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
