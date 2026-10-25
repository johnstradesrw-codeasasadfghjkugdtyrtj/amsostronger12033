CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.reject_stale_payments()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.payments
  SET status = 'rejected',
      rejection_reason = 'Payment not received!',
      reviewed_at = now()
  WHERE status IN ('pending_review', 'under_verification')
    AND created_at < now() - interval '10 minutes';
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

REVOKE ALL ON FUNCTION public.reject_stale_payments() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reject_stale_payments() TO service_role;