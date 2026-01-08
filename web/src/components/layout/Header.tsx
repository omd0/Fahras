import React, { useState } from 'react';
import { Box, Typography, Button, Stack, Avatar, useTheme, alpha, IconButton } from '@mui/material';
import { Login as LoginIcon, Menu as MenuIcon } from '@mui/icons-material';
import { Rocket as RocketIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { useNavigationMode } from '@/hooks/useResponsive';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeToggle } from './ThemeToggle';
import { MobileDrawer } from './MobileDrawer';
import { UtilityBar } from './UtilityBar';
import { PrimaryNav } from './PrimaryNav';
import { guestColors } from '@/styles/theme/guestTheme';
import { tvtcMobile } from '@/styles/theme/tvtcTheme';

/**
 * Two-Tier Header Structure for TVTC Portal Hub Design System
 *
 * Tier 1 - UtilityBar (48-56px):
 * - Logo lockup on far right (RTL)
 * - Utilities with vertical separators
 * - Accessibility/size toggles
 * - Language toggle (EN)
 * - Contact utilities (phone, mail, print)
 * - Circular teal search button
 *
 * Tier 2 - PrimaryNav (44-56px):
 * - RTL nav links with dropdown carets
 * - Hover: secondary.600
 * - Active: 2px underline in primary.600
 */
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const theme = useTheme();
  const { showMobileNav } = useNavigationMode();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
      />

      <Box
        component="header"
        role="banner"
        sx={{
          width: '100%',
          bgcolor: 'background.paper',
        }}
      >
        {/* Tier 1 - Utility Bar */}
        <UtilityBar />

        {/* Tier 2 - Primary Navigation */}
        <PrimaryNav />

        {/* Legacy content area - will be refactored */}
        {/* Keeping for backward compatibility during transition */}
      </Box>
    </>
  );
};

export default Header;











