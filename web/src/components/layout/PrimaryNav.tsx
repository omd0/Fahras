import React, { useState } from 'react';
import {
  Box,
  Stack,
  Button,
  Menu,
  MenuItem,
  useTheme,
  IconButton,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/providers/LanguageContext';
import { useNavigationMode } from '@/hooks/useResponsive';

interface NavItem {
  label: string;
  path?: string;
  children?: NavItem[];
}

/**
 * PrimaryNav Component - Tier 2 of Two-Tier Header
 *
 * Displays main navigation with RTL support
 * - Height: 44-56px
 * - Background: white
 * - Flat and clean (no heavy shadows)
 * - Active items: 2px underline in primary.600
 * - Hover: shift to secondary.600
 * - RTL nav links with dropdown carets
 */
export const PrimaryNav: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const { showMobileNav } = useNavigationMode();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const navItems: NavItem[] = [
    {
      label: t('Home') || 'Home',
      path: '/',
    },
    {
      label: t('Explore') || 'Explore',
      path: '/explore',
    },
    {
      label: t('About') || 'About',
      path: '/about',
    },
    {
      label: t('Contact') || 'Contact',
      path: '/contact',
    },
  ];

  const isActive = (path?: string) => {
    if (!path) return false;
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleDropdownOpen = (e: React.MouseEvent<HTMLElement>, label: string) => {
    setAnchorEl(e.currentTarget);
    setOpenDropdown(label);
  };

  const handleDropdownClose = () => {
    setAnchorEl(null);
    setOpenDropdown(null);
  };

  const handleNavigate = (path?: string) => {
    if (path) {
      navigate(path);
      handleDropdownClose();
    }
  };

  return (
    <Box
      component="nav"
      role="navigation"
      aria-label="Main navigation"
      sx={{
        width: '100%',
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 0,
        px: { xs: 1, sm: 2, md: 3 },
        minHeight: { xs: 44, sm: 56 },
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={{ xs: 1, sm: 2, md: 3 }}
        sx={{
          maxWidth: '1400px',
          width: '100%',
          justifyContent: 'flex-end', // RTL: right-to-left
        }}
      >
        {/* Desktop Navigation Links */}
        {!showMobileNav && (
          <>
            {navItems.map((item) => (
              <Box key={item.label}>
                <Button
                  onClick={(e) => {
                    if (item.children?.length) {
                      handleDropdownOpen(e, item.label);
                    } else {
                      handleNavigate(item.path);
                    }
                  }}
                  endIcon={
                    item.children?.length ? (
                      <ExpandMoreIcon
                        sx={{
                          transform:
                            openDropdown === item.label ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease-out',
                        }}
                      />
                    ) : undefined
                  }
                  sx={{
                    color: isActive(item.path)
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    fontSize: '14px',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    position: 'relative',
                    '&:hover': {
                      color: theme.palette.secondary.main,
                      backgroundColor: 'transparent',
                    },
                    // Active underline (2px in primary.600)
                    '&::after': isActive(item.path)
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 0,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '80%',
                          height: '2px',
                          backgroundColor: theme.palette.primary.main,
                        }
                      : {},
                  }}
                >
                  {item.label}
                </Button>

                {/* Dropdown Menu */}
                {item.children?.length && (
                  <Menu
                    anchorEl={anchorEl}
                    open={openDropdown === item.label}
                    onClose={handleDropdownClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    PaperProps={{
                      sx: {
                        borderRadius: theme.shape.borderRadius,
                        mt: 1,
                        boxShadow: theme.shadows[3],
                      },
                    }}
                  >
                    {item.children.map((child) => (
                      <MenuItem
                        key={child.label}
                        onClick={() => handleNavigate(child.path)}
                        sx={{
                          color: theme.palette.text.primary,
                          '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                            color: theme.palette.primary.main,
                          },
                        }}
                      >
                        {child.label}
                      </MenuItem>
                    ))}
                  </Menu>
                )}
              </Box>
            ))}
          </>
        )}

        {/* Mobile Menu Button */}
        {showMobileNav && (
          <IconButton
            onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
            aria-label={t('Open navigation menu') || 'Open menu'}
            sx={{
              color: theme.palette.text.primary,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Stack>
    </Box>
  );
};

export default PrimaryNav;
