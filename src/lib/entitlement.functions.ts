import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { setResponseStatus } from '@tanstack/react-start/server';
import { permitsFeature, type Entitlement } from './entitlement';

export const getEntitlement = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('subscription_entitlement');
  if (error) throw new Error('Unable to verify subscription access.');
  return data as unknown as Entitlement;
});

export const getProtectedFeature = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth])
  .inputValidator((data: { feature: 'mt5' | 'bot' | 'premium'; action?: 'status' | 'register' | 'disconnect' | 'start' | 'stop' }) => {
    if (!['mt5', 'bot', 'premium'].includes(data.feature) || (data.action && !['status','register','disconnect','start','stop'].includes(data.action))) throw new Error('Invalid feature request');
    return data;
  }).handler(async ({ data, context }) => {
    const { data: result, error } = await context.supabase.rpc('subscription_entitlement');
    if (error) throw new Error('Unable to verify subscription access.');
    const entitlement = result as unknown as Entitlement;
    if (!permitsFeature(entitlement, data.feature)) {
      setResponseStatus(403);
      return { allowed: false as const, entitlement, integration: 'unavailable' as const };
    }
    // No execution bridge is configured. Never accept credentials or pretend to register/start an account.
    if (data.action && data.action !== 'status') setResponseStatus(503);
    return { allowed: true as const, entitlement, integration: 'unavailable' as const };
  });

export const checkAdmin = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data, error } = await context.supabase.rpc('has_role', { _user_id: context.userId, _role: 'admin' });
  if (error || !data) { setResponseStatus(403); return { allowed: false }; }
  return { allowed: true };
});