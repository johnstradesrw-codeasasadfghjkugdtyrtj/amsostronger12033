ALTER TABLE public.payment_methods ADD COLUMN IF NOT EXISTS qr_image_url text;
CREATE TABLE public.site_pages (
  path text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads page status" ON public.site_pages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins manage pages" ON public.site_pages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "public reads payment qr" ON storage.objects FOR SELECT USING (bucket_id = 'payment-qr');
CREATE POLICY "admins upload payment qr" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'payment-qr' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update payment qr" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'payment-qr' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins delete payment qr" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'payment-qr' AND public.has_role(auth.uid(),'admin'));