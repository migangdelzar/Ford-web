import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../src/pages/login/ui/LoginPage';

describe('operator login page', () => {
  it('uses passkey sign-in as primary and does not offer demo roles or passwords', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /passkey|clave de acceso/i })).toHaveAttribute('href', '/api/auth/login');
    expect(screen.queryByLabelText(/contraseña|password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /propietario|gerente|asesor/i })).not.toBeInTheDocument();
  });

  it('shows email recovery form on the Spring login callback page', () => {
    window.history.replaceState({}, '', '/login');
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('link', { name: /correo|recuperación/i }));
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeInTheDocument();
  });

  it('requests an email recovery link using CSRF protection', async () => {
    window.history.replaceState({}, '', '/login');
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ accepted: true }), { status: 202 }));
    vi.stubGlobal('fetch', fetchMock);
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('link', { name: /correo|recuperación/i }));
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'operator@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/si la cuenta está activa/i));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/one-time-token', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-token' }),
    }));
    vi.unstubAllGlobals();
  });
});
