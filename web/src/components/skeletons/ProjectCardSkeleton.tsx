import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Skeleton,
} from '@mui/material';
import { DashboardTheme } from '@/config/dashboardThemes';

interface ProjectCardSkeletonProps {
  theme: DashboardTheme;
  showProgress?: boolean;
  showApprovalStatus?: boolean;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  theme,
  showProgress = false,
  showApprovalStatus = false,
}) => {
  return (
    <Card
      sx={{
        border: `1px solid ${theme.borderColor}`,
        borderRadius: 2,
        height: '100%',
      }}
    >
      <CardContent>
        {/* Header with icon, title, and status chip */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, gap: 1 }}>
            <Skeleton variant="circular" width={24} height={24} />
            <Skeleton variant="text" width="60%" height={32} />
          </Box>
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>

        {/* Abstract/Description */}
        <Box sx={{ mb: 2, minHeight: 40 }}>
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
          <Skeleton variant="text" width="70%" />
        </Box>

        {/* Progress Bar (conditional) */}
        {showProgress && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Skeleton variant="text" width={60} height={16} />
              <Skeleton variant="text" width={40} height={16} />
            </Box>
            <Skeleton 
              variant="rounded" 
              width="100%" 
              height={6} 
              sx={{ borderRadius: 3 }}
            />
          </Box>
        )}

        {/* Date and Approval Status */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={120} height={16} />
          </Box>
          {showApprovalStatus && (
            <Skeleton variant="rounded" width={70} height={24} />
          )}
        </Box>

        {/* Creator and Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="circular" width={16} height={16} />
            <Skeleton variant="text" width={100} height={16} />
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
