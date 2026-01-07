import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon, Home as HomeIcon } from '@mui/icons-material';
import { Link as RouterLink, useLocation } from 'react-router-dom';

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

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ 
  items = [], 
  separator = <NavigateNextIcon fontSize="small" />,
  showHome = true,
}) => {
  const location = useLocation();

  // Generate breadcrumbs from current location if no items provided
  const generatedItems = items.length > 0 ? items : generateBreadcrumbsFromPath(location.pathname);

  // Always include home as first item if showHome is true
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
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              underline="hover"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: 'text.secondary',
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
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

// Helper function to generate breadcrumbs from URL path
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';
  
  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    currentPath += `/${segment}`;
    
    // Skip if it's a numeric ID or slug (will be replaced by actual project name)
    if (/^\d+$/.test(segment) || /^[a-z0-9]{6}$/i.test(segment)) {
      continue;
    }
    
    // Map common paths to readable labels
    const label = getLabelFromSegment(segment);
    
    // Only add path if not the last item
    const isLast = i === pathSegments.length - 1;
    
    breadcrumbs.push({
      label,
      path: isLast ? undefined : currentPath,
    });
  }

  return breadcrumbs;
}

// Map URL segments to readable labels
function getLabelFromSegment(segment: string): string {
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

  return labelMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
}
