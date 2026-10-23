CREATE OR REPLACE FUNCTION public.registered_user_total() RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT count(*) FROM public.profiles; $$;
REVOKE EXECUTE ON FUNCTION public.registered_user_total() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registered_user_total() TO anon,authenticated,service_role;