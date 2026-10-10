import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPage } from '../../src/pages/login/ui/LoginPage';

describe('LoginPage', () => {
  it('starts passkey sign-in through Spring from every UI route', () => {
    render(<LoginPage />);

    expect(screen.getByRole('link', { name: /iniciar sesión con passkey/i })).toHaveAttribute('href', '#passkey');
  });
});
