import React from 'react';
import { Box, Stack, IconButton, useTheme, Tooltip, Divider } from '@mui/material';
import {
  Search as SearchIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  Print as PrintIcon,
  Language as LanguageIcon,
} from '@mui/icons-material';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useLanguage } from '@/providers/LanguageContext';

/**
 * UtilityBar Component - Tier 1 of Two-Tier Header
 *
 * Displays:
 * - Logo lockup on far right (RTL)
 * - Accessibility/size toggles
 * - Language toggle
 * - Contact utilities (account, mail, phone, print)
 * - Circular teal search button
 *
 * Height: 48-56px
 * Background: white
 * Border: 1px bottom border (border.200)
 */
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
        justifyContent: 'flex-end', // RTL: right-to-left
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
        {/* Search Button - Circular teal (primary.500) */}
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

        {/* Vertical Divider */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            height: 32,
            alignSelf: 'center',
          }}
        />

        {/* Phone Icon */}
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

        {/* Mail Icon */}
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

        {/* Print Icon */}
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

        {/* Vertical Divider */}
        <Divider
          orientation="vertical"
          flexItem
          sx={{
            mx: 0.5,
            height: 32,
            alignSelf: 'center',
          }}
        />

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle />
      </Stack>
    </Box>
  );
};

export default UtilityBar;
