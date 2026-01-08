import React, { useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@/providers/ThemeContext';
import { createTvtcTheme, tvtcCSSVariables } from '@/styles/theme/tvtcTheme';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LanguageProvider, useLanguage } from '@/providers/LanguageContext';
import { useThemeStore } from '@/store/themeStore';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { router } from '@/router';

// Apply TVTC CSS variables globally
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = tvtcCSSVariables;
  document.head.appendChild(style);
}

const createEmotionCache = (direction: 'ltr' | 'rtl') =>
  createCache({
    key: direction === 'rtl' ? 'mui-rtl' : 'mui',
    stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
  });

const AppContent: React.FC = () => {
  const { direction } = useLanguage();
  const { mode } = useThemeStore();

  const theme = useMemo(() => createTvtcTheme(direction, mode), [direction, mode]);
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