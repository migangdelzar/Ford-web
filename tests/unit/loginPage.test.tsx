import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoginPage } from '../../src/pages/login/ui/LoginPage';

describe('operator login page', () => {
  it('uses passkey sign-in as primary and does not offer demo roles or passwords', () => {
    render(<LoginPage />);
    expect(screen.getByRole('link', { name: /passkey|clave de acceso/i })).toHaveAttribute('href', '#passkey');
    expect(screen.queryByLabelText(/contraseña|password/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /propietario|gerente|asesor/i })).not.toBeInTheDocument();
  });

  it('shows email recovery form on the Spring login callback page', () => {
    window.history.replaceState({}, '', '/login');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ token: 'csrf', headerName: 'X-XSRF-TOKEN' }), { status: 200 })));
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
    await waitFor(() => expect(screen.getByRole('button', { name: /enviar enlace/i })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /enviar enlace/i }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/si la cuenta está activa/i));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/api/auth/one-time-token', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-token' }),
    }));
    vi.unstubAllGlobals();
  });

  it('submits password login with the SPA CSRF header instead of a form token parameter', async () => {
    window.history.replaceState({}, '', '/login');
    const failedLogin = { ok: false, status: 401, url: 'http://localhost/login' } as Response;
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ token: 'csrf-token', headerName: 'X-XSRF-TOKEN' }), { status: 200 }))
      .mockResolvedValueOnce(failedLogin);
    vi.stubGlobal('fetch', fetchMock);
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /usuario y contraseña/i }));
    await waitFor(() => expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument());
    expect(screen.getByLabelText(/correo electrónico/i)).toHaveValue('miky.delzar@gmail.com');
    expect(screen.getByLabelText(/contraseña/i)).toHaveAttribute('name', 'password');
    expect(screen.getByRole('button', { name: /iniciar con contraseña/i })).toBeEnabled();
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'test-password' } });
    fireEvent.submit(screen.getByRole('button', { name: /iniciar con contraseña/i }).closest('form')!);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenNthCalledWith(2, '/login', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin',
      headers: expect.objectContaining({ 'X-XSRF-TOKEN': 'csrf-token' }),
      body: new URLSearchParams({ username: 'miky.delzar@gmail.com', password: 'test-password' }),
    }));
    expect(fetchMock.mock.calls[1][1].body.toString()).not.toContain('_csrf');
    expect(screen.queryByDisplayValue('csrf-token')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/no se pudo iniciar sesión/i));
    vi.unstubAllGlobals();
  });

  it('shows a generic message when password sign-in fails', () => {
    window.history.replaceState({}, '', '/login?error');
    render(<LoginPage />);
    expect(screen.getByRole('alert')).toHaveTextContent(/el correo o la contraseña no son válidos/i);
  });
});
