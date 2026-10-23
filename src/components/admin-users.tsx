import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Users, ShieldCheck } from 'lucide-react';
import { getAdminUsers, manageUser } from '@/lib/admin.functions';
import { canManageAccount } from '@/lib/admin-rules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function AdminUsers() {
  const load = useServerFn(getAdminUsers);
  const manage = useServerFn(manageUser);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-users'], queryFn: () => load() });
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const update = async (userId: string, suspended: boolean) => {
    const reason = suspended ? window.prompt('Reason for suspending paid access?') : '';
    if (reason === null) return;
    setBusy(userId);
    try { await manage({ data: { userId, suspended, reason } }); toast.success(suspended ? 'Paid access suspended' : 'Paid access restored'); await qc.invalidateQueries(); }
    catch { toast.error('Unable to update this account.'); }
    finally { setBusy(null); }
  };
  if (isLoading) return <p className="py-8" role="status">Loading accounts…</p>;
  if (error || !data) return <p role="alert">Unable to load accounts.</p>;
  const users = data.users.filter(u => `${u.email ?? ''} ${u.full_name ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  return <section className="mt-6 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-5">
      <div className="flex items-center gap-3"><Users className="h-7 w-7 text-primary" /><div><p className="font-display text-3xl font-bold">{data.users.length}</p><p className="text-sm text-muted-foreground">Registered users</p></div></div>
      <Badge variant="outline"><ShieldCheck className="mr-2 h-4 w-4" />{data.isSuperAdmin ? 'Super administrator' : 'Administrator'}</Badge>
    </div>
    <div className="relative max-w-md"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><Input aria-label="Search users" placeholder="Search name or email" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} /></div>
    <div className="divide-y rounded-lg border bg-card">
      {users.map(user => <div key={user.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center">
        <div className="min-w-0"><p className="break-all font-semibold">{user.email}</p><p className="text-sm text-muted-foreground">{user.full_name || 'Member'} · Joined {new Date(user.created_at).toLocaleDateString()}</p>{user.reason && <p className="mt-1 text-sm text-muted-foreground">{user.reason}</p>}</div>
        <div className="flex shrink-0 items-center gap-3"><Badge variant={user.suspended ? 'destructive' : 'outline'}>{user.isAdmin ? 'Admin' : user.suspended ? 'Suspended' : 'Member'}</Badge>{canManageAccount(data.isSuperAdmin, user.isAdmin) && <Button size="sm" variant={user.suspended ? 'outline' : 'destructive'} disabled={busy === user.id} onClick={() => update(user.id, !user.suspended)}>{user.suspended ? 'Restore access' : 'Suspend paid access'}</Button>}</div>
      </div>)}
      {users.length === 0 && <p className="p-5 text-muted-foreground">No matching users.</p>}
    </div>
  </section>;
}