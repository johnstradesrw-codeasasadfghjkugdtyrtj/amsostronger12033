import { describe,it,expect } from 'vitest';
import { canDownloadBot,validBotFile } from '@/lib/bot-rules';
import { zipSync,strToU8 } from 'fflate';
describe('private bot file access',()=>{
  it('allows only a paid purchaser',()=>expect(canDownloadBot({user_id:'a',status:'paid'},'a')).toBe(true));
  it('denies another customer',()=>expect(canDownloadBot({user_id:'a',status:'paid'},'b')).toBe(false));
  it.each(['awaiting_payment','under_review','rejected','cancelled','refunded'])('denies %s orders',status=>expect(canDownloadBot({user_id:'a',status},'a')).toBe(false));
  it('denies revoked purchases',()=>expect(canDownloadBot({user_id:'a',status:'paid'},'a',true)).toBe(false));
  it('rejects renamed executables',()=>expect(validBotFile('bot.zip',new Uint8Array([77,90,0,0]))).toBe(false));
  it('rejects a fake ZIP header',()=>expect(validBotFile('bot.zip',new Uint8Array([80,75,3,4,1]))).toBe(false));
  it('accepts a bot archive',()=>expect(validBotFile('bot.zip',zipSync({'bot.mq5':strToU8('#property strict')}))).toBe(true));
  it('rejects archive path traversal',()=>expect(validBotFile('bot.zip',zipSync({'../bot.ex5':strToU8('test')}))).toBe(false));
  it('rejects empty source files',()=>expect(validBotFile('bot.mq5',new Uint8Array())).toBe(false));
  it('accepts MQL source',()=>expect(validBotFile('bot.mq5',new TextEncoder().encode('#property strict\nvoid OnTick() {}'))).toBe(true));
});