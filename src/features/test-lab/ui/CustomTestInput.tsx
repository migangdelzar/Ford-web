import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Send } from 'lucide-react';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

interface CustomTestInputProps {
  isLoading: boolean;
  onEvaluate: (prompt: string) => void;
}

export const CustomTestInput: React.FC<CustomTestInputProps> = ({
  isLoading,
  onEvaluate,
}) => {
  const { t } = useTranslation();
  const [customPrompt, setCustomPrompt] = useState('');

  const handleSubmit = () => {
    if (!customPrompt.trim() || isLoading) return;
    onEvaluate(customPrompt);
    setCustomPrompt('');
  };

  return (
    <Card variant="default" padding="sm" className="space-y-2">
      <label htmlFor="custom-test-input" className="text-xs font-bold text-slate-700 block">
        {t('testLab.customPrompt')}
      </label>
      <div className="flex items-center gap-2">
        <input
          id="custom-test-input"
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder={t('testLab.customPromptPlaceholder')}
          className="flex-1 px-3 py-1.5 bg-[#F8F9FB] border border-[#EEF0F3] rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#007AFF] transition-all"
        />
        <Button
          variant="primary"
          size="xs"
          isLoading={isLoading}
          leftIcon={<Send className="w-3.5 h-3.5" />}
          onClick={handleSubmit}
          disabled={!customPrompt.trim()}
        />
      </div>
    </Card>
  );
};
