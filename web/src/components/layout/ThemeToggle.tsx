import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeStore } from '@/store/themeStore';
import { useLanguage } from '@/providers/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useThemeStore();
  const { t } = useLanguage();

  return (
    <Tooltip title={mode === 'light' ? t('Switch to Dark Mode') : t('Switch to Light Mode')}>
      <IconButton
        onClick={toggleTheme}
        color="inherit"
        sx={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'rotate(180deg)',
          },
        }}
        aria-label={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {mode === 'light' ? <Brightness4 /> : <Brightness7 />}
      </IconButton>
    </Tooltip>
  );
};
