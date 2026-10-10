import { describe, expect, it } from 'vitest';
import { authenticatedRedirect, unauthenticatedRedirect } from '../../src/shared/lib/authRouting';

describe('unauthenticated route handling', () => {
  it('keeps the login page as the only unauthenticated page', () => {
    expect(unauthenticatedRedirect('/')).toBe('/login');
    expect(unauthenticatedRedirect('/inbox')).toBe('/login');
    expect(unauthenticatedRedirect('/login')).toBeNull();
  });

  it('returns signed-in operators from the login URL to the CRM root', () => {
    expect(authenticatedRedirect('/login')).toBe('/');
    expect(authenticatedRedirect('/')).toBeNull();
  });
});
