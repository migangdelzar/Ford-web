import React from 'react';
import { Bot, User } from 'lucide-react';
import { ThreadStatus } from '../../../types';
import { Button } from '../../../shared/ui';

interface TakeoverButtonProps {
  status: ThreadStatus;
  onToggle: () => void;
}

export const TakeoverButton: React.FC<TakeoverButtonProps> = ({ status, onToggle }) => {
  const isHuman = status === 'human';

  return (
    <Button
      id="btn-takeover-toggle"
      variant={isHuman ? 'purple' : 'primary'}
      size="xs"
      onClick={onToggle}
      leftIcon={isHuman ? <Bot className="size-3.5" /> : <User className="size-3.5" />}
    >
      {isHuman ? 'Devolver al Bot' : 'Tomar control'}
    </Button>
  );
};

export default TakeoverButton;
