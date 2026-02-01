import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Bookmark as BookmarkIcon } from '@mui/icons-material';
import { useBookmark } from '@/features/bookmarks/hooks/useBookmark';
import { useLanguage } from '@/providers/LanguageContext';

interface BookmarkButtonProps {
  projectId: number;
  size?: 'small' | 'medium' | 'large';
  sx?: React.CSSProperties;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({ 
  projectId, 
  size = 'small',
  sx 
}) => {
  const { isBookmarked, toggleBookmark, loading } = useBookmark(projectId);
  const { t } = useLanguage();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking bookmark
    toggleBookmark();
  };

  return (
    <Tooltip title={isBookmarked ? t('Remove Bookmark') : t('Bookmark Project')}>
      <IconButton
        size={size}
        onClick={handleClick}
        disabled={loading}
        sx={{
          color: isBookmarked ? 'info.main' : (sx?.color || 'inherit'),
          ...sx,
        }}
      >
        <BookmarkIcon 
          fontSize={size} 
          sx={{
            fill: isBookmarked ? 'currentColor' : 'none',
            stroke: isBookmarked ? 'currentColor' : 'currentColor',
            strokeWidth: isBookmarked ? 0 : 1.5,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
