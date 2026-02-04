'use client';

import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { Bookmark as BookmarkIcon } from '@mui/icons-material';
import { useBookmark } from '@/features/bookmarks/hooks/useBookmark';
import { useLanguage } from '@/providers/LanguageContext';

export interface BookmarkButtonProps {
  projectId: number;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  projectId,
  size = 'small',
  sx,
}) => {
  const { isBookmarked, toggleBookmark, loading } = useBookmark(projectId);
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark();
  };

  return (
    <Tooltip title={isBookmarked ? t('Remove Bookmark') : t('Bookmark Project')}>
      <IconButton
        size={size}
        onClick={handleClick}
        disabled={loading}
        sx={[
          { color: isBookmarked ? 'info.main' : 'inherit' },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        <BookmarkIcon
          fontSize={size}
          sx={{
            fill: isBookmarked ? 'currentColor' : 'none',
            stroke: 'currentColor',
            strokeWidth: isBookmarked ? 0 : 1.5,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
