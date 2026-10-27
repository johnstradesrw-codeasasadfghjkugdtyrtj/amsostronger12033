-- Buyers can read the listing details of products they ordered (even if later unpublished)
CREATE POLICY bot_products_buyer_read ON public.bot_products FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.bot_orders o WHERE o.product_id = bot_products.id AND o.user_id = auth.uid()));

-- Admin read access for marketplace administration
CREATE POLICY bot_file_metadata_admin_read ON public.bot_file_metadata FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY bot_payment_submissions_admin_read ON public.bot_payment_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY bot_download_logs_admin_read ON public.bot_download_logs FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY bot_audit_admin_read ON public.bot_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Admin: create/update a listing and attach an already-uploaded private file, atomically
CREATE OR REPLACE FUNCTION public.admin_save_bot_product(_id uuid, _fields jsonb, _file jsonb DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  pid uuid := coalesce(_id, gen_random_uuid());
  is_new boolean;
  v_name text := trim(coalesce(_fields->>'name',''));
  v_price numeric;
  v_pub boolean := coalesce((_fields->>'published')::boolean, false);
  v_limit integer := coalesce((_fields->>'download_limit')::integer, 0);
  v_image text := nullif(_fields->>'image_url','');
  fpath text; fname text; fsize integer;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF length(v_name) < 2 OR length(v_name) > 120 THEN RAISE EXCEPTION 'Bot name must be 2 to 120 characters.'; END IF;
  BEGIN v_price := (_fields->>'price')::numeric; EXCEPTION WHEN others THEN v_price := NULL; END;
  IF v_price IS NULL OR v_price <= 0 OR v_price > 1000000 THEN RAISE EXCEPTION 'Enter a price above 0.'; END IF;
  IF v_limit < 0 OR v_limit > 10000 THEN RAISE EXCEPTION 'Download limit must be between 0 and 10000.'; END IF;
  IF v_image IS NOT NULL AND (length(v_image) > 7000000 OR v_image !~ '^data:image/(png|jpeg|webp);base64,') THEN RAISE EXCEPTION 'Use a JPG, PNG or WebP thumbnail up to 5 MB.'; END IF;
  is_new := NOT EXISTS (SELECT 1 FROM bot_products WHERE id = pid);
  IF NOT is_new AND EXISTS (SELECT 1 FROM bot_products WHERE id = pid AND deleted) THEN RAISE EXCEPTION 'This listing was deleted.'; END IF;
  IF _file IS NOT NULL THEN
    fpath := _file->>'path'; fname := _file->>'filename'; fsize := (_file->>'size_bytes')::integer;
    IF fpath IS NULL OR fpath NOT LIKE pid::text || '/%' OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'bot-files' AND name = fpath) THEN
      RAISE EXCEPTION 'Bot file upload was not found. Please choose the file again.';
    END IF;
    IF fname IS NULL OR fname !~* '^[\w .()-]{1,120}\.(zip|pdf|mq4|mq5)$' THEN RAISE EXCEPTION 'Upload a ZIP, PDF, MQ4 or MQ5 bot file.'; END IF;
    IF fsize IS NULL OR fsize <= 0 OR fsize > 20000000 THEN RAISE EXCEPTION 'Bot file must be 20MB or smaller.'; END IF;
  END IF;
  IF is_new THEN INSERT INTO bot_products(id, name, price, published) VALUES (pid, v_name, v_price, false); END IF;
  UPDATE bot_products SET
    name = v_name, price = v_price,
    category = left(coalesce(nullif(trim(_fields->>'category'),''),'Forex'),80),
    platform = left(coalesce(nullif(trim(_fields->>'platform'),''),'MT5'),40),
    short_description = left(coalesce(_fields->>'short_description',''),400),
    description = left(coalesce(_fields->>'description',''),12000),
    instructions = left(coalesce(_fields->>'instructions',''),12000),
    features = coalesce(ARRAY(SELECT left(x,300) FROM jsonb_array_elements_text(coalesce(_fields->'features','[]'::jsonb)) x LIMIT 40), '{}'),
    instruments = coalesce(ARRAY(SELECT left(x,100) FROM jsonb_array_elements_text(coalesce(_fields->'instruments','[]'::jsonb)) x LIMIT 40), '{}'),
    image_url = v_image,
    available = coalesce((_fields->>'available')::boolean, true),
    requires_subscription = coalesce((_fields->>'requires_subscription')::boolean, false),
    download_limit = v_limit,
    published = v_pub
  WHERE id = pid;
  IF _file IS NOT NULL THEN
    INSERT INTO bot_file_metadata(product_id, path, filename, size_bytes, content_type, uploaded_at)
    VALUES (pid, fpath, fname, fsize, coalesce(nullif(_file->>'content_type',''),'application/octet-stream'), now())
    ON CONFLICT (product_id) DO UPDATE SET path = EXCLUDED.path, filename = EXCLUDED.filename, size_bytes = EXCLUDED.size_bytes, content_type = EXCLUDED.content_type, uploaded_at = now();
  END IF;
  IF v_pub AND NOT EXISTS (SELECT 1 FROM bot_file_metadata WHERE product_id = pid) THEN RAISE EXCEPTION 'Attach a bot file before publishing.'; END IF;
  INSERT INTO bot_audit(actor, action, details) VALUES (auth.uid(), 'product_saved', jsonb_build_object('product', pid, 'published', v_pub, 'file_uploaded', _file IS NOT NULL));
  RETURN pid;
END $$;

CREATE OR REPLACE FUNCTION public.admin_remove_bot_product(_product uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE bot_products SET deleted = true, published = false WHERE id = _product;
  INSERT INTO bot_audit(actor, action, details) VALUES (auth.uid(), 'product_deleted', jsonb_build_object('product', _product));
END $$;

CREATE OR REPLACE FUNCTION public.admin_save_bot_announcement(_enabled boolean, _heading text, _message text, _destination text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF length(trim(coalesce(_heading,''))) = 0 OR length(_heading) > 150 OR length(coalesce(_message,'')) > 1000 THEN RAISE EXCEPTION 'Check the heading and message length.'; END IF;
  IF _destination NOT IN ('/get-bot-file','/pricing','/dashboard/bot-files') THEN RAISE EXCEPTION 'Choose /get-bot-file, /pricing or /dashboard/bot-files.'; END IF;
  INSERT INTO bot_announcement(id, enabled, heading, message, destination) VALUES (true, _enabled, _heading, coalesce(_message,''), _destination)
  ON CONFLICT (id) DO UPDATE SET enabled = EXCLUDED.enabled, heading = EXCLUDED.heading, message = EXCLUDED.message, destination = EXCLUDED.destination;
  INSERT INTO bot_audit(actor, action, details) VALUES (auth.uid(), 'announcement_saved', jsonb_build_object('enabled', _enabled));
END $$;

CREATE OR REPLACE FUNCTION public.cancel_bot_order(_order uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE bot_orders SET status = 'cancelled' WHERE id = _order AND user_id = auth.uid() AND status = 'awaiting_payment';
  IF NOT FOUND THEN RAISE EXCEPTION 'This order cannot be cancelled.'; END IF;
  INSERT INTO bot_audit(actor, action, details) VALUES (auth.uid(), 'order_cancelled', jsonb_build_object('order', _order));
END $$;

-- Buyer download: logs the request, enforces limits, returns the private path
CREATE OR REPLACE FUNCTION public.request_bot_download(_order uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
  RETURN public.authorize_bot_download(_order, auth.uid());
END $$;

CREATE OR REPLACE FUNCTION public.can_read_bot_file(_path text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM bot_file_metadata f
    JOIN bot_entitlements e ON e.product_id = f.product_id AND e.user_id = auth.uid() AND NOT e.revoked
    JOIN bot_orders o ON o.id = e.order_id AND o.status = 'paid'
    WHERE f.path = _path
  ) AND NOT EXISTS (SELECT 1 FROM account_access WHERE user_id = auth.uid() AND suspended)
$$;

CREATE POLICY bot_file_buyer_read ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'bot-files' AND public.can_read_bot_file(name));

REVOKE ALL ON FUNCTION public.admin_save_bot_product(uuid, jsonb, jsonb) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_remove_bot_product(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_save_bot_announcement(boolean, text, text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.cancel_bot_order(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.request_bot_download(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.can_read_bot_file(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_save_bot_product(uuid, jsonb, jsonb) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_remove_bot_product(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.admin_save_bot_announcement(boolean, text, text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.cancel_bot_order(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.request_bot_download(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.can_read_bot_file(text) TO authenticated, service_role;