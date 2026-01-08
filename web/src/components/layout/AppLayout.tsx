import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Header } from './Header';
import { HeaderLogo } from './HeaderLogo';
import { SkipNavigation } from '@/components/shared/SkipLink';
import { CommandPalette } from '@/components/CommandPalette';

export const AppLayout: React.FC = () => {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
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
        {/* Command Palette */}
        <CommandPalette
          open={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />

        {/* Header with Logo, Language Switcher, and Login */}
        <Header />

        <Box
          id="main-content"
          component="main"
          sx={{ flexGrow: 1 }}
        >
          <Outlet />
        </Box>

        {/* Footer Logo */}
        <HeaderLogo variant="footer" />
      </Box>
    </>
  );
};
