import { describe, it, expect } from 'vitest';
import { blockedPage } from '@/lib/maintenance';
describe('maintenance', () => {
  it('blocks sub pages of a disabled section', () => expect(blockedPage('/dashboard/mt5', ['/dashboard'])).toBe('/dashboard'));
  it('home only blocks exact /', () => expect(blockedPage('/pricing', ['/'])).toBeNull());
  it('never blocks admin', () => expect(blockedPage('/admin', ['/admin', '/'])).toBeNull());
});
