import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ReactNode } from 'react';

export function HomepageMedia({children}:{children:ReactNode}) {
  const [media,setMedia]=useState<{media_type:string;updated_at:string}|null>(null);
  useEffect(()=>{
    let active=true;
    void supabase.from('homepage_media_settings').select('media_type,updated_at').eq('id',true).maybeSingle().then(({data})=>{if(active)setMedia(data);});
    return ()=>{active=false;};
  },[]);
  if(!media) return children;
  const url=`/api/public/homepage-media?v=${encodeURIComponent(media.updated_at)}`;
  return <div className="mx-auto w-full max-w-md overflow-hidden rounded-lg border border-editorial/30 bg-card shadow-[var(--shadow-editorial)]">
    {media.media_type.startsWith('image/')?<img src={url} alt="Quantum Multi Assets Matrix showcase" className="block max-h-[260px] w-full object-contain sm:max-h-[420px]" onError={()=>setMedia(null)} />:<video src={url} controls autoPlay muted loop playsInline preload="metadata" aria-label="Homepage showcase video" className="block max-h-[260px] w-full object-contain sm:max-h-[420px]" onError={()=>setMedia(null)} />}
  </div>;
}