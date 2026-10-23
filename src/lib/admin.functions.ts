import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

export const getAdminUsers = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const role = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (role.error || !role.data) throw new Error('Forbidden');
  const [users, access, roles, superAdmin] = await Promise.all([
    context.supabase.from('profiles').select('id,email,full_name,created_at').order('created_at', { ascending: false }),
    context.supabase.from('account_access').select('user_id,suspended,reason'),
    context.supabase.from('user_roles').select('user_id,role'),
    context.supabase.rpc('is_super_admin'),
  ]);
  if (users.error || access.error || roles.error || superAdmin.error) throw new Error('Unable to load accounts.');
  return { isSuperAdmin: superAdmin.data, users: (users.data ?? []).map(user => ({ ...user, suspended: access.data?.find(a => a.user_id === user.id)?.suspended ?? false, reason: access.data?.find(a => a.user_id === user.id)?.reason, isAdmin: roles.data?.some(r => r.user_id === user.id && r.role === 'admin') ?? false })) };
});

export const manageUser = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ userId: z.string().uuid(), suspended: z.boolean(), reason: z.string().trim().max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc('manage_account_access', { _user_id: data.userId, _suspended: data.suspended, _reason: data.reason });
    if (error) throw new Error('Account change denied. Administrator accounts are protected.');
    return { saved: true };
  });