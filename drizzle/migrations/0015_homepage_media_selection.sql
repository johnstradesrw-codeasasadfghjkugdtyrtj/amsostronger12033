CREATE TABLE public.homepage_media_settings (id boolean PRIMARY KEY DEFAULT true, path text NOT NULL, media_type text NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), CONSTRAINT homepage_media_singleton CHECK (id), CONSTRAINT homepage_media_type CHECK (media_type IN ('image/jpeg','image/png','image/webp','video/mp4','video/webm')));
GRANT SELECT ON public.homepage_media_settings TO anon, authenticated;
GRANT ALL ON public.homepage_media_settings TO service_role;
ALTER TABLE public.homepage_media_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public homepage selection" ON public.homepage_media_settings FOR SELECT TO anon, authenticated USING (true);