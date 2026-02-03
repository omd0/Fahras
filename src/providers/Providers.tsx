'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LanguageProvider, useLanguage } from '@/providers/LanguageContext';
import { ThemeProvider } from '@/providers/ThemeContext';
import { EmotionCacheProvider } from '@/providers/EmotionCacheProvider';
import { createFahrasTheme } from '@/styles/theme/fahrasTheme';

function InnerProviders({ children }: { children: React.ReactNode }) {
  const { direction } = useLanguage();
  const muiTheme = createFahrasTheme(direction);

  return (
    <EmotionCacheProvider direction={direction}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        <ThemeProvider>{children}</ThemeProvider>
      </MuiThemeProvider>
    </EmotionCacheProvider>
  );
}

export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <InnerProviders>{children}</InnerProviders>
    </LanguageProvider>
  );
};
