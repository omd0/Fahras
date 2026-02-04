'use client';

import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Header } from './Header';
import { HeaderLogo } from './HeaderLogo';
import { SkipNavigation } from '@/components/shared/SkipLink';
import { CommandPalette } from '@/components/CommandPalette';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <SkipNavigation />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        <Header />

        <Box
          id="main-content"
          component="main"
          sx={{ flexGrow: 1 }}
        >
          {children}
        </Box>

        <HeaderLogo variant="footer" />
      </Box>
    </>
  );
};
