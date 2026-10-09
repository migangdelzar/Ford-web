import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LoginPage } from '../../src/pages/login/ui/LoginPage';

describe('operator login page', () => {
  it('uses passkey sign-in as primary and does not offer demo roles or passwords', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /passkey|clave de acceso/i })).toHaveAttribute('href', '/api/auth/login');
    expect(screen.queryByLabelText(/contraseña|password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /propietario|gerente|asesor/i })).not.toBeInTheDocument();
  });

  it('routes email recovery through the OAuth authorization flow', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /correo|recuperación/i })).toHaveAttribute('href', '/api/auth/login');
  });
});
