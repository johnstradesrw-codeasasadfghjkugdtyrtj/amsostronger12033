import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { homepageMediaType } from './media-rules';

export const selectHomepageMedia = createServerFn({method:'POST'})
  .middleware([requireSupabaseAuth])
  .inputValidator((v:unknown)=>z.object({path:z.string().max(240).nullable()}).parse(v))
  .handler(async({data,context})=>{
    const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
    if(role.error||!role.data) throw new Error('Forbidden');
    const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
    if(!data.path){
      const result=await admin.from('homepage_media_settings').delete().eq('id',true);
      if(result.error) throw new Error('Unable to restore original media.');
      return {saved:true};
    }
    if(!/^[\w-]+\/[\w.-]+$/.test(data.path)) throw new Error('Invalid media path.');
    const file=await admin.storage.from('site-media').download(data.path);
    if(file.error||!file.data||file.data.size>50_000_000) throw new Error('Media unavailable.');
    const type=homepageMediaType(new Uint8Array(await file.data.slice(0,16).arrayBuffer()));
    if(!type) throw new Error('Choose a JPG, PNG, WebP, MP4 or WebM file.');
    const saved=await admin.from('homepage_media_settings').upsert({id:true,path:data.path,media_type:type,updated_at:new Date().toISOString()});
    if(saved.error) throw new Error('Unable to change homepage media.');
    return {saved:true};
  });