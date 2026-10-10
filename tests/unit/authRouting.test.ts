import { describe, expect, it } from 'vitest';
import { unauthenticatedRedirect } from '../../src/shared/lib/authRouting';

describe('unauthenticated route handling', () => {
  it('keeps the login page as the only unauthenticated page', () => {
    expect(unauthenticatedRedirect('/')).toBe('/login');
    expect(unauthenticatedRedirect('/inbox')).toBe('/login');
    expect(unauthenticatedRedirect('/login')).toBeNull();
  });
});
