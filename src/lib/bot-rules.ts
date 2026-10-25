import { unzipSync } from 'fflate';
export const botStatus = { awaiting_payment: 'Awaiting Payment', under_review: 'Payment Under Review', paid: 'Paid', rejected: 'Rejected', cancelled: 'Cancelled', refunded: 'Refunded' };
export function canDownloadBot(order: { user_id: string; status: string }, userId: string, revoked = false) {
  return order.user_id === userId && order.status === 'paid' && !revoked;
}
export function validBotFile(name: string, bytes: Uint8Array) {
  if (!/^[\w .()-]{1,120}\.(zip|pdf|mq4|mq5)$/i.test(name) || bytes.length === 0 || bytes.length > 20_000_000) return false;
  const ext = name.split('.').pop()?.toLowerCase();
  if (ext === 'zip') {
    try {
      let total=0; let entries=0;
      const files=unzipSync(bytes,{filter:entry=>{total+=entry.originalSize;entries++;if(total>50_000_000||entries>100||entry.name.includes('..')||entry.name.startsWith('/')||entry.name.includes('\\'))throw new Error('Unsafe archive');return true;}});
      return Object.keys(files).some(n=>/\.(ex4|ex5|mq4|mq5|pdf)$/i.test(n)) && Object.keys(files).every(n=>n.endsWith('/')||/\.(ex4|ex5|mq4|mq5|pdf|txt|set|png|jpg|jpeg)$/i.test(n));
    } catch { return false; }
  }
  if (ext === 'pdf') return new TextDecoder().decode(bytes.slice(0,5)) === '%PDF-';
  try { const text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); return !text.includes('\0') && /(#property|OnInit\s*\(|OnTick\s*\(|start\s*\()/m.test(text); } catch { return false; }
}
export const defaultAnnouncement = { enabled: true, heading: 'Introducing Get Bot File 🗃️', message: 'Discover specialized Forex trading bots available for individual purchase. Explore product details, compare features, and securely purchase the bot files you need with a one-time payment.', destination: '/get-bot-file' };