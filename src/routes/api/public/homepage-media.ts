import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/public/homepage-media')({
  server:{handlers:{GET:async()=>{
    // Only the administrator's explicitly published homepage selection is exposed.
    const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
    const selection=await admin.from('homepage_media_settings').select('path,media_type,updated_at').eq('id',true).maybeSingle();
    if(selection.error) return new Response('Media unavailable',{status:503});
    if(!selection.data) return new Response(null,{status:204});
    const file=await admin.storage.from('site-media').download(selection.data.path);
    if(file.error||!file.data) return new Response('Media unavailable',{status:404});
    return new Response(file.data,{headers:{'Content-Type':selection.data.media_type,'X-QMAM-Media-Type':selection.data.media_type,'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
  }}}
});