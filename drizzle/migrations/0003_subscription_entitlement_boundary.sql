CREATE TABLE public.account_access (user_id uuid PRIMARY KEY REFERENCES public.profiles(id), suspended boolean NOT NULL DEFAULT false, reason text);
GRANT SELECT ON public.account_access TO authenticated;
GRANT ALL ON public.account_access TO service_role;
ALTER TABLE public.account_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own or admin access read" ON public.account_access FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id), ADD COLUMN IF NOT EXISTS entitled_features text[] NOT NULL DEFAULT '{}', ADD COLUMN IF NOT EXISTS mt5_limit integer NOT NULL DEFAULT 0;
UPDATE public.subscriptions s SET plan_id=p.plan_id, entitled_features=pl.features, mt5_limit=pl.mt5_limit FROM public.payments p JOIN public.plans pl ON pl.id=p.plan_id WHERE s.payment_id=p.id AND s.plan_id IS NULL;
CREATE OR REPLACE FUNCTION public.subscription_entitlement() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=auth.uid(); sub public.subscriptions; state text; now_at timestamptz:=clock_timestamp();
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE='28000'; END IF;
 IF EXISTS(SELECT 1 FROM public.account_access WHERE user_id=uid AND suspended) THEN RETURN jsonb_build_object('status','suspended','allowed',false,'server_time',now_at); END IF;
 SELECT s.* INTO sub FROM public.subscriptions s JOIN public.payments p ON p.id=s.payment_id AND p.user_id=uid AND p.status='approved' WHERE s.user_id=uid AND NOT s.revoked AND s.starts_at<=now_at AND s.expires_at>now_at ORDER BY s.expires_at DESC LIMIT 1;
 IF sub.id IS NOT NULL THEN RETURN jsonb_build_object('status','active','allowed',true,'subscription_id',sub.id,'plan_name',sub.plan_name,'expires_at',sub.expires_at,'features',sub.entitled_features,'mt5_limit',sub.mt5_limit,'server_time',now_at); END IF;
 IF EXISTS(SELECT 1 FROM public.payments WHERE user_id=uid AND status IN ('pending_review','under_verification')) THEN state:='pending';
 ELSE
 SELECT s.* INTO sub FROM public.subscriptions s JOIN public.payments p ON p.id=s.payment_id AND p.user_id=uid AND p.status='approved' WHERE s.user_id=uid ORDER BY s.created_at DESC LIMIT 1;
 state:=CASE WHEN sub.id IS NULL THEN 'none' WHEN sub.revoked THEN 'revoked' WHEN sub.expires_at<=now_at THEN 'expired' ELSE 'scheduled' END;
 END IF;
 RETURN jsonb_build_object('status',state,'allowed',false,'server_time',now_at);
END $$;
REVOKE ALL ON FUNCTION public.subscription_entitlement() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.subscription_entitlement() TO authenticated;
CREATE OR REPLACE FUNCTION public.has_active_subscription(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.subscriptions s JOIN public.payments p ON p.id=s.payment_id AND p.user_id=s.user_id AND p.status='approved' WHERE s.user_id=_user_id AND NOT s.revoked AND s.starts_at<=now() AND s.expires_at>now()) AND NOT EXISTS(SELECT 1 FROM public.account_access WHERE user_id=_user_id AND suspended) $$;
CREATE OR REPLACE FUNCTION public.review_payment(_payment_id uuid,_approve boolean,_reason text DEFAULT NULL) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE pay public.payments; pl public.plans; last_exp timestamptz;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 SELECT * INTO pay FROM public.payments WHERE id=_payment_id FOR UPDATE;
 IF pay.id IS NULL THEN RAISE EXCEPTION 'Not found'; END IF;
 IF pay.status='approved' AND _approve THEN RETURN; END IF;
 IF pay.status NOT IN ('pending_review','under_verification') THEN RAISE EXCEPTION 'Already reviewed'; END IF;
 IF _approve THEN
 PERFORM pg_advisory_xact_lock(hashtextextended(pay.user_id::text,0));
 IF EXISTS(SELECT 1 FROM public.account_access WHERE user_id=pay.user_id AND suspended) THEN RAISE EXCEPTION 'Account suspended'; END IF;
 SELECT * INTO pl FROM public.plans WHERE id=pay.plan_id;
 IF pay.duration_days<=0 OR pl.id IS NULL THEN RAISE EXCEPTION 'Invalid subscription plan'; END IF;
 UPDATE public.payments SET status='approved',reviewed_at=now() WHERE id=pay.id;
 SELECT max(expires_at) INTO last_exp FROM public.subscriptions WHERE user_id=pay.user_id AND NOT revoked AND expires_at>now();
 IF NOT EXISTS(SELECT 1 FROM public.subscriptions WHERE payment_id=pay.id) THEN
 INSERT INTO public.subscriptions(user_id,payment_id,plan_id,plan_name,price,starts_at,expires_at,entitled_features,mt5_limit) VALUES(pay.user_id,pay.id,pay.plan_id,pay.plan_name,pay.amount,coalesce(last_exp,now()),coalesce(last_exp,now())+make_interval(days=>pay.duration_days),pl.features,pl.mt5_limit);
 END IF;
 ELSE UPDATE public.payments SET status='rejected',rejection_reason=coalesce(_reason,'Rejected'),reviewed_at=now() WHERE id=pay.id;
 END IF;
END $$;