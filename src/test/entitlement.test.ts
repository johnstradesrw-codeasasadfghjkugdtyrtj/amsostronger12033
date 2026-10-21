import { describe,it,expect } from 'vitest';
import { permitsFeature, type Entitlement } from '@/lib/entitlement';
import { safeReturnPath } from '@/lib/navigation';
const active: Entitlement = { status: 'active', allowed: true, mt5_limit: 1, features: ['1 MT5 account'], server_time: '2026-10-21T03:08:00Z' };
describe('Subscription feature rules', () => {
 for (const status of ['none','pending','expired','revoked','suspended','scheduled'] as const) it(`${status} never grants MT5 access`, () => { expect(permitsFeature({ ...active, status, allowed: false },'mt5')).toBe(false); });
 it('active approved access permits the included MT5 account', () => expect(permitsFeature(active,'mt5')).toBe(true));
 it('no MT5 allowance denies MT5 access', () => expect(permitsFeature({...active,mt5_limit:0},'mt5')).toBe(false));
 it('MT5 subscription alone cannot grant bot execution', () => expect(permitsFeature(active,'bot')).toBe(false));
 it('bot execution requires an explicit included feature', () => expect(permitsFeature({...active,features:['Bot execution']},'bot')).toBe(true));
 it('premium trading requires an explicit included feature', () => expect(permitsFeature(active,'premium')).toBe(false));
});
describe('Safe authentication return destinations', () => {
 it('preserves the intended MT5 destination', () => expect(safeReturnPath('/dashboard/connect-mt5')).toBe('/dashboard/connect-mt5'));
 for (const target of ['https://evil.invalid','//evil.invalid','/\\evil.invalid','/auth','/login?redirect=/auth']) it(`rejects unsafe or looping destination ${target}`, () => expect(safeReturnPath(target)).toBe('/dashboard'));
});