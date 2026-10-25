import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { validBotFile, defaultAnnouncement } from './bot-rules';
import type { Database } from '@/integrations/supabase/types';

export const getBotCatalog = createServerFn({ method: 'GET' }).handler(async () => {
  const url = process.env['SUPABASE_URL']; const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) throw new Error('Marketplace unavailable.');
  const client = createClient<Database>(url,key,{ auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers); if(key.startsWith('sb_') && h.get('Authorization')===`Bearer ${key}`) h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}} });
  const [products,announcement] = await Promise.all([client.from('bot_products').select('*').eq('published',true).eq('deleted',false).order('created_at',{ascending:false}),client.from('bot_announcement').select('*').maybeSingle()]);
  if(products.error || announcement.error) throw new Error('Unable to load the marketplace.');
  return { products:products.data ?? [], announcement:announcement.data ?? defaultAnnouncement };
});

export const startBotOrder = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({productId:z.string().uuid()}).parse(v)).handler(async({data,context})=>{
  const result=await context.supabase.rpc('create_bot_order',{_product:data.productId});
  if(result.error) throw new Error(result.error.message); return {orderId:result.data};
});
export const getBotOrders = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const result=await context.supabase.from('bot_orders').select('*').eq('user_id',context.userId).order('created_at',{ascending:false});
  if(result.error) throw new Error('Unable to load orders.');
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const ids=(result.data ?? []).map(o=>o.product_id);
  const products=ids.length ? await admin.from('bot_products').select('id,name,image_url,instructions,platform,download_limit').in('id',ids) : {data:[]};
  return (result.data ?? []).map(o=>({...o,product:products.data?.find(p=>p.id===o.product_id)}));
});
export const submitBotPayment = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({orderId:z.string().uuid(),methodId:z.string().uuid(),reference:z.string().trim().min(3).max(200),proof:z.string().nullable()}).parse(v)).handler(async({data,context})=>{
  const r=await context.supabase.rpc('submit_bot_payment',{_order:data.orderId,_method:data.methodId,_reference:data.reference,_proof:data.proof ?? ''});
  if(r.error) throw new Error(r.error.message);return {saved:true};
});
export const cancelBotOrder = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({orderId:z.string().uuid()}).parse(v)).handler(async({data,context})=>{
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const result=await admin.from('bot_orders').update({status:'cancelled'}).eq('id',data.orderId).eq('user_id',context.userId).eq('status','awaiting_payment').select('id');
  if(result.error || !result.data?.length) throw new Error('This order cannot be cancelled.');
  await admin.from('bot_audit').insert({actor:context.userId,action:'order_cancelled',details:{order:data.orderId}});return {saved:true};
});
export const downloadBot = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({orderId:z.string().uuid()}).parse(v)).handler(async({data,context})=>{
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const r=await admin.rpc('authorize_bot_download',{_order:data.orderId,_user:context.userId});
  if(r.error) throw new Error(r.error.message);
  const file=z.object({path:z.string(),filename:z.string()}).parse(r.data);
  const signed=await admin.storage.from('bot-files').createSignedUrl(file.path,60,{download:file.filename});
  if(signed.error) throw new Error('Unable to prepare download.');
  const browserUrl=import.meta.env['VITE_SUPABASE_URL'];
  return {url:browserUrl+new URL(signed.data.signedUrl).pathname+new URL(signed.data.signedUrl).search};
});

export const getBotAdmin = createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error || !role.data) throw new Error('Forbidden');
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const [products,files,orders,submissions,profiles,logs,audit,announcement]=await Promise.all([admin.from('bot_products').select('*').eq('deleted',false).order('created_at',{ascending:false}),admin.from('bot_file_metadata').select('product_id,filename,size_bytes'),admin.from('bot_orders').select('*').order('created_at',{ascending:false}),admin.from('bot_payment_submissions').select('*'),admin.from('profiles').select('id,email'),admin.from('bot_download_logs').select('*').order('created_at',{ascending:false}).limit(200),admin.from('bot_audit').select('*').order('created_at',{ascending:false}).limit(100),admin.from('bot_announcement').select('*').maybeSingle()]);
  if([products,files,orders,submissions,profiles,logs,audit,announcement].some(r=>r.error))throw new Error('Unable to load marketplace administration.');
  return {products:products.data??[],files:files.data??[],orders:(orders.data??[]).map(o=>({...o,email:profiles.data?.find(p=>p.id===o.user_id)?.email,submission:submissions.data?.find(s=>s.order_id===o.id)})),logs:logs.data??[],audit:audit.data??[],announcement:announcement.data??defaultAnnouncement};
});
const productSchema=z.object({id:z.string().uuid().optional(),name:z.string().trim().min(2).max(120),category:z.string().trim().min(1).max(80),platform:z.string().trim().min(1).max(40),price:z.number().positive().max(1000000),short_description:z.string().max(400),description:z.string().max(12000),instructions:z.string().max(12000),features:z.array(z.string().max(300)).max(40),instruments:z.array(z.string().max(100)).max(40),image_url:z.string().nullable(),published:z.boolean(),available:z.boolean(),requires_subscription:z.boolean(),download_limit:z.number().int().min(0).max(10000)});
export const saveBotProduct=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>productSchema.parse(v)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data)throw new Error('Forbidden');
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  if(data.image_url && (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(data.image_url)||data.image_url.length>700000))throw new Error('Use a product image under 500KB.');
  if(data.published){if(!data.id)throw new Error('Save a draft and upload its file before publishing.');const file=await admin.from('bot_file_metadata').select('product_id').eq('product_id',data.id).maybeSingle();if(!file.data)throw new Error('Upload a bot file before publishing.');}
  const {id,...fields}=data;const r=id?await admin.from('bot_products').update(fields).eq('id',id).select('id').single():await admin.from('bot_products').insert(fields).select('id').single();
  if(r.error)throw new Error('Unable to save product.');await admin.from('bot_audit').insert({actor:context.userId,action:'product_saved',details:{product:r.data.id,published:data.published}});return r.data;
});
export const removeBotProduct=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({productId:z.string().uuid()}).parse(v)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data)throw new Error('Forbidden');const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const r=await admin.from('bot_products').update({deleted:true,published:false}).eq('id',data.productId);if(r.error)throw new Error('Unable to delete listing.');await admin.from('bot_audit').insert({actor:context.userId,action:'product_deleted',details:{product:data.productId}});return {saved:true};
});
export const uploadBotFile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>{if(!(v instanceof FormData))throw new Error('Invalid upload');return v;}).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data)throw new Error('Forbidden');
  const id=z.string().uuid().parse(data.get('productId'));const file=data.get('file');if(!(file instanceof File)||file.size>20000000)throw new Error('Choose a bot file under 20MB.');
  const bytes=new Uint8Array(await file.arrayBuffer());if(!validBotFile(file.name,bytes))throw new Error('Invalid file. Upload a valid ZIP, PDF, MQ4 or MQ5. Package EX4/EX5 files in a ZIP.');
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');const product=await admin.from('bot_products').select('id').eq('id',id).single();if(product.error)throw new Error('Save the product first.');
  const path=`${id}/${crypto.randomUUID()}/${file.name}`;const r=await admin.storage.from('bot-files').upload(path,bytes,{contentType:'application/octet-stream'});if(r.error)throw new Error('Upload failed.');
  const saved=await admin.from('bot_file_metadata').upsert({product_id:id,path,filename:file.name,size_bytes:file.size,content_type:file.type||'application/octet-stream'});if(saved.error)throw new Error('Unable to save file metadata.');await admin.from('bot_audit').insert({actor:context.userId,action:'file_uploaded',details:{product:id,filename:file.name,size:file.size}});return {saved:true};
});
export const reviewBotOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({orderId:z.string().uuid(),status:z.enum(['paid','rejected','refunded']),reason:z.string().max(500)}).parse(v)).handler(async({data,context})=>{
  const r=await context.supabase.rpc('review_bot_order',{_order:data.orderId,_status:data.status,_reason:data.reason});if(r.error)throw new Error(r.error.message);return {saved:true};
});
export const viewBotProof=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({orderId:z.string().uuid()}).parse(v)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data)throw new Error('Forbidden');const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');const p=await admin.from('bot_payment_submissions').select('proof_path').eq('order_id',data.orderId).single();if(!p.data?.proof_path)throw new Error('No screenshot submitted.');const r=await admin.storage.from('bot-order-proofs').createSignedUrl(p.data.proof_path,60);if(r.error)throw new Error('Unable to open proof.');const u=new URL(r.data.signedUrl);return {url:import.meta.env['VITE_SUPABASE_URL']+u.pathname+u.search};
});
export const saveBotAnnouncement=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({enabled:z.boolean(),heading:z.string().min(1).max(150),message:z.string().max(1000),destination:z.enum(['/get-bot-file','/pricing','/dashboard/bot-files'])}).parse(v)).handler(async({data,context})=>{
  const role=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});if(role.error||!role.data)throw new Error('Forbidden');const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');const r=await admin.from('bot_announcement').upsert({id:true,...data});if(r.error)throw new Error('Unable to save announcement.');await admin.from('bot_audit').insert({actor:context.userId,action:'announcement_saved',details:{enabled:data.enabled}});return {saved:true};
});