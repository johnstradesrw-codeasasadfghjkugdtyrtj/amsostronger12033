import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from '@tanstack/react-router';
import { Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { blockedPage } from '@/lib/maintenance';
import { SUPPORT_URL } from '@/lib/site';

export function useSitePages() {
  return useQuery({
    queryKey: ['site-pages'],
    queryFn: async () => (await supabase.from('site_pages').select('*')).data ?? [],
    staleTime: 30000,
  });
}

export function MaintenanceGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { data: pages } = useSitePages();
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin'],
    queryFn: async () => {
      const { data: s } = await supabase.auth.getSession();
      const uid = s.session?.user.id;
      if (!uid) return false;
      return !!(await supabase.rpc('has_role', { _user_id: uid, _role: 'admin' })).data;
    },
    staleTime: 60000,
  });
  const disabled = (pages ?? []).filter(p => !p.enabled);
  const hit = blockedPage(pathname, disabled.map(p => p.path));
  if (!hit || isAdmin) return <>{children}</>;
  const msg = disabled.find(p => p.path === hit)?.message;
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-primary"><Wrench className="h-7 w-7" /></div>
        <h1 className="font-display text-2xl font-bold">Under maintenance</h1>
        <p className="mt-2 text-muted-foreground">{msg || 'We are improving this page. Please check back shortly.'}</p>
        <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">Contact support</a>
      </div>
    </div>
  );
}
