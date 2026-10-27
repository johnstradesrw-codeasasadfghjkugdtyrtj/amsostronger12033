// Bot marketplace data access through the signed-in browser client.
// Authorization lives in RLS policies and SECURITY DEFINER SQL functions, so these
// calls work on any host (including external deployments without server secrets).
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { defaultAnnouncement, validBotFile } from './bot-rules';
import { validThumbnail } from './media-rules';
import type { Tables } from '@/integrations/supabase/types';

const fail = (message: string): never => { throw new Error(message); };

export async function loadBotCatalog() {
  const [products, announcement] = await Promise.all([
    supabase.from('bot_products').select('*').eq('published', true).eq('deleted', false).order('created_at', { ascending: false }),
    supabase.from('bot_announcement').select('*').maybeSingle(),
  ]);
  if (products.error) console.error('Marketplace load failed', products.error.message);
  return { products: products.data ?? [], announcement: announcement.data ?? defaultAnnouncement };
}
export type BotCatalog = Awaited<ReturnType<typeof loadBotCatalog>>;

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? fail('Please sign in again.');
}

export async function loadBotOrders() {
  const userId = await currentUserId();
  const orders = await supabase.from('bot_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (orders.error) fail('Unable to load your bot orders. Please refresh.');
  const ids = [...new Set((orders.data ?? []).map((o) => o.product_id))];
  const products = ids.length
    ? await supabase.from('bot_products').select('id,name,image_url,instructions,platform,download_limit').in('id', ids)
    : { data: [] as Pick<Tables<'bot_products'>, 'id' | 'name' | 'image_url' | 'instructions' | 'platform' | 'download_limit'>[] };
  return (orders.data ?? []).map((o) => ({ ...o, product: products.data?.find((p) => p.id === o.product_id) }));
}

export async function startBotOrder(productId: string) {
  const r = await supabase.rpc('create_bot_order', { _product: productId });
  if (r.error) fail(r.error.message);
  return { orderId: r.data as string };
}
export async function submitBotPayment(input: { orderId: string; methodId: string; reference: string; proof: string | null }) {
  const reference = input.reference.trim();
  if (reference.length < 3 || reference.length > 200) fail('Enter a transaction reference (3–200 characters).');
  const r = await supabase.rpc('submit_bot_payment', { _order: input.orderId, _method: input.methodId, _reference: reference, _proof: input.proof ?? '' });
  if (r.error) fail(r.error.message);
}
export async function cancelBotOrder(orderId: string) {
  const r = await supabase.rpc('cancel_bot_order', { _order: orderId });
  if (r.error) fail(r.error.message);
}
export async function downloadBot(orderId: string) {
  const r = await supabase.rpc('request_bot_download', { _order: orderId });
  if (r.error) fail(r.error.message);
  const file = z.object({ path: z.string(), filename: z.string() }).parse(r.data);
  const signed = await supabase.storage.from('bot-files').createSignedUrl(file.path, 60, { download: file.filename });
  if (signed.error) fail('Unable to prepare download. Please try again.');
  return { url: signed.data!.signedUrl };
}

// ---------- Admin ----------
export async function loadBotAdmin() {
  const [products, files, orders, submissions, profiles, logs, audit, announcement] = await Promise.all([
    supabase.from('bot_products').select('*').eq('deleted', false).order('created_at', { ascending: false }),
    supabase.from('bot_file_metadata').select('product_id,filename,size_bytes'),
    supabase.from('bot_orders').select('*').order('created_at', { ascending: false }),
    supabase.from('bot_payment_submissions').select('*'),
    supabase.from('profiles').select('id,email'),
    supabase.from('bot_download_logs').select('*').order('created_at', { ascending: false }).limit(200),
    supabase.from('bot_audit').select('*').order('created_at', { ascending: false }).limit(100),
    supabase.from('bot_announcement').select('*').maybeSingle(),
  ]);
  if ([products, files, orders, submissions, profiles, logs, audit, announcement].some((r) => r.error)) fail('Unable to load marketplace administration.');
  return {
    products: products.data ?? [],
    files: files.data ?? [],
    orders: (orders.data ?? []).map((o) => ({ ...o, email: profiles.data?.find((p) => p.id === o.user_id)?.email, submission: submissions.data?.find((s) => s.order_id === o.id) })),
    logs: logs.data ?? [],
    audit: audit.data ?? [],
    announcement: announcement.data ?? defaultAnnouncement,
  };
}

export type BotProductInput = {
  id?: string | undefined; name: string; category: string; platform: string; price: number;
  short_description: string; description: string; instructions: string; features: string[]; instruments: string[];
  image_url: string | null; published: boolean; available: boolean; requires_subscription: boolean; download_limit: number;
};

/** Uploads the private bot file (if any) and saves the listing in one database transaction. */
export async function saveBotProduct(product: BotProductInput, file: File | null) {
  if (product.name.trim().length < 2) fail('Enter a bot name (at least 2 characters).');
  if (!(product.price > 0)) fail('Enter a price above 0.');
  if (product.image_url) {
    const b64 = product.image_url.split(',')[1] ?? '';
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    if (!validThumbnail(bytes)) fail('Thumbnail must be a JPG, PNG or WebP image up to 5 MB.');
  }
  if (product.published && !file && !product.id) fail('Attach a bot file before publishing.');
  const productId = product.id ?? crypto.randomUUID();
  let uploadedPath: string | null = null;
  let fileMeta: Record<string, unknown> | null = null;
  if (file) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (!validBotFile(file.name, bytes)) fail('Upload a valid ZIP, PDF, MQ4 or MQ5 bot file up to 20MB. Put EX4/EX5 files inside a ZIP. File names may use letters, numbers, spaces, dots, dashes and brackets.');
    uploadedPath = `${productId}/${crypto.randomUUID()}/${file.name}`;
    const up = await supabase.storage.from('bot-files').upload(uploadedPath, bytes, { contentType: 'application/octet-stream', upsert: false });
    if (up.error) fail(`Bot file upload failed: ${up.error.message}`);
    fileMeta = { path: uploadedPath, filename: file.name, size_bytes: file.size, content_type: file.type || 'application/octet-stream' };
  }
  const { id: _ignored, ...fields } = product;
  const r = await supabase.rpc('admin_save_bot_product', { _id: productId, _fields: fields, _file: fileMeta as never });
  if (r.error) {
    if (uploadedPath) await supabase.storage.from('bot-files').remove([uploadedPath]);
    fail(r.error.message);
  }
  return { id: r.data as string };
}
export async function removeBotProduct(productId: string) {
  const r = await supabase.rpc('admin_remove_bot_product', { _product: productId });
  if (r.error) fail(r.error.message);
}
export async function reviewBotOrder(input: { orderId: string; status: 'paid' | 'rejected' | 'refunded'; reason: string }) {
  const r = await supabase.rpc('review_bot_order', { _order: input.orderId, _status: input.status, _reason: input.reason });
  if (r.error) fail(r.error.message);
}
export async function viewBotProof(orderId: string) {
  const p = await supabase.from('bot_payment_submissions').select('proof_path').eq('order_id', orderId).maybeSingle();
  if (!p.data?.proof_path) fail('No screenshot submitted.');
  const r = await supabase.storage.from('bot-order-proofs').createSignedUrl(p.data!.proof_path!, 60);
  if (r.error) fail('Unable to open proof.');
  return { url: r.data!.signedUrl };
}
export async function saveBotAnnouncement(a: { enabled: boolean; heading: string; message: string; destination: string }) {
  const r = await supabase.rpc('admin_save_bot_announcement', { _enabled: a.enabled, _heading: a.heading, _message: a.message, _destination: a.destination });
  if (r.error) fail(r.error.message);
}
