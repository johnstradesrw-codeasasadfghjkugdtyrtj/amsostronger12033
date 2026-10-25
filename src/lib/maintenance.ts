export const MANAGED_PAGES = [
  { path: '/', label: 'Home page' },
  { path: '/features', label: 'Features' },
  { path: '/how-it-works', label: 'How it works' },
  { path: '/pricing', label: 'Pricing' },
  { path: '/faq', label: 'FAQ' },
  { path: '/get-bot-file', label: 'Forex Bot Marketplace' },
  { path: '/dashboard/bot-files', label: 'My Bot Files' },
  { path: '/dashboard/bot-orders', label: 'Bot File Orders' },
  { path: '/auth', label: 'Sign in / Sign up' },
  { path: '/dashboard', label: 'Dashboard (all pages)' },
  { path: '/dashboard/plans', label: 'Subscribe / Plans' },
  { path: '/dashboard/pay', label: 'Payment page' },
  { path: '/dashboard/mt5', label: 'Connect MT5' },
  { path: '/dashboard/bot', label: 'Bot' },
  { path: '/resources', label: 'Resources' },
] as const;

/** Returns the disabled managed page that covers this path, if any. Admin pages are never blocked. */
export function blockedPage(pathname: string, disabled: string[]): string | null {
  if (pathname.startsWith('/admin')) return null;
  const p = pathname.replace(/\/+$/, '') || '/';
  const hits = disabled.filter(d => (d === '/' ? p === '/' : p === d || p.startsWith(d + '/')));
  return hits.sort((a, b) => b.length - a.length)[0] ?? null;
}
