'use client';

/**
 * CommandPalette - Stub for Next.js migration
 * TODO: Full migration from web/src/components/CommandPalette.tsx
 */
import React from 'react';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ open, onClose }) => {
  // Stub: will be fully migrated in a dedicated task
  React.useEffect(() => {
    if (open) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [open, onClose]);

  if (!open) return null;

  return null;
};
