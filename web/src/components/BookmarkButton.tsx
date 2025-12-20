import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Bookmark as BookmarkIcon } from '@mui/icons-material';
import { useBookmark } from '../hooks/useBookmark';
import { useLanguage } from '../contexts/LanguageContext';

interface BookmarkButtonProps {
  projectId: number;
  size?: 'small' | 'medium' | 'large';
  sx?: any;
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
          color: isBookmarked ? '#1976d2' : (sx?.color || 'inherit'),
          ...sx,
        }}
      >
        <BookmarkIcon 
          fontSize={size} 
          sx={{
            fill: isBookmarked ? '#1976d2' : 'none',
            stroke: isBookmarked ? '#1976d2' : 'currentColor',
            strokeWidth: isBookmarked ? 0 : 1.5,
          }}
        />
      </IconButton>
    </Tooltip>
  );
};
