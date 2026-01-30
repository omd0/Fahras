import React, { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@/providers/ThemeContext';
import { createFahrasTheme } from '@/styles/theme/fahrasTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider, useLanguage } from '@/providers/LanguageContext';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { router } from '@/router';

const createEmotionCache = (direction: 'ltr' | 'rtl') =>
  createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui',
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
  });

const AppContent: React.FC = () => {
  const { direction } = useLanguage();

  const theme = useMemo(() => createFahrasTheme(direction), [direction]);
  const rtlCache = useMemo(() => createEmotionCache('rtl'), []);
  const ltrCache = useMemo(() => createEmotionCache('ltr'), []);
  const cache = direction === 'rtl' ? rtlCache : ltrCache;

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <ThemeProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </ThemeProvider>
      </MuiThemeProvider>
    </CacheProvider>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
