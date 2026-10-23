import { describe, expect, it } from 'vitest';
import { canManageAccount } from '../lib/admin-rules';
describe('super administrator management', () => {
  it('allows super administrators to manage normal accounts', () => expect(canManageAccount(true, false)).toBe(true));
  it('denies ordinary administrators account management', () => expect(canManageAccount(false, false)).toBe(false));
  it('protects administrator accounts from suspension', () => expect(canManageAccount(true, true)).toBe(false));
});