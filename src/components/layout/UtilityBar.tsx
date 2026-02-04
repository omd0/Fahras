'use client';

import React from 'react';
import { Box, Stack, IconButton, useTheme, Tooltip, Divider } from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/providers/LanguageContext';

export const UtilityBar: React.FC = () => {
  const theme = useTheme();
  const { t } = useLanguage();

  return (
    <Box
      component="div"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1,
        px: { xs: 1.5, sm: 2, md: 3 },
        minHeight: { xs: 48, sm: 56 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={0.5}
        sx={{
          maxWidth: '1400px',
          width: '100%',
          justifyContent: 'flex-end',
        }}
      >
        <Tooltip title={t('Search') || 'Search'}>
          <IconButton
            aria-label={t('Open search') || 'Open search'}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: 'white',
              borderRadius: '50%',
              width: 44,
              height: 44,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:focus-visible': {
                outline: `3px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
              },
            }}
          >
            <SearchIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            height: 32,
            alignSelf: 'center',
          }}
        />

        <Tooltip title={t('Phone') || 'Phone'}>
          <IconButton
            aria-label={t('Phone') || 'Phone'}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <PhoneIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('Mail') || 'Mail'}>
          <IconButton
            aria-label={t('Mail') || 'Mail'}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <MailIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Tooltip title={t('Print') || 'Print'}>
          <IconButton
            aria-label={t('Print') || 'Print'}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            height: 32,
            alignSelf: 'center',
          }}
        />

        <LanguageSwitcher />

        <ThemeToggle />
      </Stack>
    </Box>
  );
};

export default UtilityBar;
