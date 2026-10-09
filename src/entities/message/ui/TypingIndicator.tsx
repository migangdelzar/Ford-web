import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { IconBadge } from '../../../shared/ui';

export const TypingIndicator: React.FC<{ label?: string }> = ({
  label = 'Concierge IA generando respuesta...',
}) => {
  return (
    <div className="flex justify-end my-2">
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.12 } }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl rounded-tr-xs bg-purple-50/80 border border-purple-200/70 shadow-2xs"
      >
        <IconBadge icon={Sparkles} color="purple" size="xs" />
        <span className="text-xs font-medium text-purple-900 mr-1">{label}</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-purple-600"
              animate={{
                y: [0, -4, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TypingIndicator;
