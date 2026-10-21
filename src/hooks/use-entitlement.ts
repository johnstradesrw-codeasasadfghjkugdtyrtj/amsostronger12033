import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getEntitlement, getProtectedFeature } from '@/lib/entitlement.functions';
export function useEntitlement() {
  const fetch = useServerFn(getEntitlement);
  return useQuery({ queryKey: ['entitlement'], queryFn: () => fetch(), staleTime: 0, refetchInterval: 10000, refetchOnWindowFocus: true });
}
export function useProtectedFeature(feature: 'mt5' | 'bot') {
  const fetch = useServerFn(getProtectedFeature);
  return useQuery({ queryKey: ['protected-feature', feature], queryFn: () => fetch({ data: { feature, action: 'status' } }), staleTime: 0, refetchInterval: 10000, refetchOnWindowFocus: true });
}