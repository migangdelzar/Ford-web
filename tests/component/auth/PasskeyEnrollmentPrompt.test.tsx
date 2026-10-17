import React from 'react';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasskeyEnrollmentPrompt } from '../../../src/features/auth/ui/PasskeyEnrollmentPrompt';

describe('PasskeyEnrollmentPrompt', () => {
  it('asks an authenticated operator without a passkey to set one up', () => {
    render(<PasskeyEnrollmentPrompt hasPasskey={false} onEnrolled={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Configure una passkey' })).toBeDefined();
  });

  it('does not prompt when passkey status is present or unresolved', () => {
    const { rerender } = render(<PasskeyEnrollmentPrompt hasPasskey={true} onEnrolled={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(<PasskeyEnrollmentPrompt hasPasskey={null} onEnrolled={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('lets the operator continue without changing their session', () => {
    render(<PasskeyEnrollmentPrompt hasPasskey={false} onEnrolled={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Más tarde' }));

    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('dismisses after successful registration', async () => {
    const register = vi.fn().mockResolvedValue(undefined);
    const onEnrolled = vi.fn();
    function Harness() {
      const [hasPasskey, setHasPasskey] = useState(false);
      return <PasskeyEnrollmentPrompt hasPasskey={hasPasskey} register={register} onEnrolled={() => {
        onEnrolled();
        setHasPasskey(true);
      }} />;
    }
    render(<Harness />);
    fireEvent.click(screen.getByRole('button', { name: 'Configurar passkey' }));

    await waitFor(() => expect(onEnrolled).toHaveBeenCalledOnce());
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('keeps Later available and shows an error when registration fails', async () => {
    const register = vi.fn().mockRejectedValue(new Error('No se pudo completar el registro.'));
    render(<PasskeyEnrollmentPrompt hasPasskey={false} register={register} onEnrolled={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Configurar passkey' }));

    expect(await screen.findByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Más tarde' })).toBeDefined();
  });

  it('uses concise copy when the browser cancels WebAuthn', async () => {
    const register = vi.fn().mockRejectedValue(new DOMException(
      'The operation either timed out or was not allowed.',
      'NotAllowedError',
    ));
    render(<PasskeyEnrollmentPrompt hasPasskey={false} register={register} onEnrolled={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Configurar passkey' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo completar el registro de la passkey.',
    );
  });
});
