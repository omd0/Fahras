import React from 'react';
import {
  Card,
  CardContent,
  Skeleton,
  Stack,
} from '@mui/material';
import { designTokens } from '@/styles/designTokens';

interface ProjectCardSkeletonProps {
  showRating?: boolean;
}

export const ProjectCardSkeleton: React.FC<ProjectCardSkeletonProps> = ({
  showRating = false,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: designTokens.radii.card,
        border: `2px solid ${designTokens.colors.border[200]}`,
        boxShadow: designTokens.shadows.none,
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: { xs: 2.5, sm: 3 },
        }}
      >
        {/* Icon Badge Skeleton */}
        <Skeleton
          variant="circular"
          width={80}
          height={80}
          sx={{ mb: 2 }}
        />

        {/* Title Skeleton */}
        <Skeleton
          variant="text"
          width="80%"
          height={28}
          sx={{ mb: 0.5 }}
        />
        <Skeleton
          variant="text"
          width="60%"
          height={28}
          sx={{ mb: 1 }}
        />

        {/* Metadata Chips Skeleton */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 1.5 }}
        >
          <Skeleton
            variant="rounded"
            width={80}
            height={24}
            sx={{ borderRadius: '12px' }}
          />
          <Skeleton
            variant="rounded"
            width={70}
            height={24}
            sx={{ borderRadius: '12px' }}
          />
        </Stack>

        {/* Abstract/Description Skeleton */}
        <Skeleton
          variant="text"
          width="90%"
          height={18}
          sx={{ mb: 0.3 }}
        />
        <Skeleton
          variant="text"
          width="85%"
          height={18}
          sx={{ mb: 2 }}
        />

        {/* Rating Skeleton (conditional) */}
        {showRating && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0.5}
            sx={{ mb: 2 }}
          >
            <Skeleton variant="rectangular" width={100} height={20} />
            <Skeleton variant="text" width={40} height={16} />
          </Stack>
        )}

        {/* Creator Skeleton */}
        <Skeleton
          variant="text"
          width={120}
          height={16}
          sx={{ mb: 2 }}
        />

        {/* Action Buttons Skeleton */}
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mt: 'auto' }}
        >
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </CardContent>
    </Card>
  );
};
