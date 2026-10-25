CREATE POLICY "admins manage site media"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users read own site media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'site-media' AND (storage.foldername(name))[1] = auth.uid()::text);