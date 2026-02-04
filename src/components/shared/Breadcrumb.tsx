'use client';

import React from 'react';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';

export interface BreadcrumbItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
}

const labelMap: Record<string, string> = {
  'pr': 'Projects',
  'projects': 'Projects',
  'create': 'Create Project',
  'edit': 'Edit',
  'follow': 'Follow Manager',
  'code': 'Repository',
  'admin': 'Admin',
  'access-control': 'Access Control',
  'milestone-templates': 'Milestone Templates',
  'dashboard': 'Dashboard',
  'explore': 'Explore',
  'bookmarks': 'Bookmarks',
  'analytics': 'Analytics',
  'evaluations': 'Evaluations',
  'users': 'User Management',
  'profile': 'Profile',
  'settings': 'Settings',
  'approvals': 'Approvals',
  'advisor-projects': 'Advisor Projects',
  'notifications': 'Notifications',
  'faculty': 'Faculty',
  'student': 'Student',
  'pending-approval': 'Pending Approval',
  'my-projects': 'My Projects',
};

function getLabelFromSegment(segment: string): string {
  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;

    if (/^\d+$/.test(segment) || /^[a-z0-9]{6}$/i.test(segment)) {
      continue;
    }

    const label = getLabelFromSegment(segment);
    const isLast = i === pathSegments.length - 1;

    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  }

  return breadcrumbs;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items = [],
  separator = <NavigateNextIcon fontSize="small" />,
  showHome = true,
}) => {
  const pathname = usePathname();

  const generatedItems = items.length > 0 ? items : generateBreadcrumbsFromPath(pathname);

  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', path: '/dashboard', icon: <HomeIcon fontSize="small" /> }, ...generatedItems]
    : generatedItems;

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={separator}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 1,
          },
        }}
      >
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          if (isLast || !item.path) {
            return (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'text.primary',
                }}
              >
                {item.icon}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            );
          }

          return (
            <Box
              key={index}
              component={NextLink}
              href={item.path}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              {item.icon}
              <Typography
                variant="body2"
                sx={{
                  color: 'inherit',
                }}
              >
                {item.label}
              </Typography>
            </Box>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};
