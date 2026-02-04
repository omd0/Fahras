'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/features/auth/store';
import { apiService } from '@/lib/api';
import {
  addGuestBookmark,
  removeGuestBookmark,
  isGuestBookmarked,
} from '@/utils/bookmarkCookies';

interface UseBookmarkReturn {
  isBookmarked: boolean;
  toggleBookmark: () => Promise<void>;
  loading: boolean;
}

export function useBookmark(projectId: number): UseBookmarkReturn {
  const { isAuthenticated } = useAuthStore();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      apiService
        .isProjectBookmarked(projectId)
        .then((response) => {
          setIsBookmarked(response.is_bookmarked);
        })
        .catch((error: unknown) => {
          console.error('Error checking bookmark status:', error);
        });
    } else {
      setIsBookmarked(isGuestBookmarked(projectId));
    }
  }, [projectId, isAuthenticated]);

  const toggleBookmark = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        if (isBookmarked) {
          await apiService.unbookmarkProject(projectId);
          setIsBookmarked(false);
        } else {
          await apiService.bookmarkProject(projectId);
          setIsBookmarked(true);
        }
      } else {
        if (isBookmarked) {
          removeGuestBookmark(projectId);
          setIsBookmarked(false);
        } else {
          addGuestBookmark(projectId);
          setIsBookmarked(true);
        }
      }
    } catch (error: unknown) {
      console.error('Error toggling bookmark:', error);
      setIsBookmarked(!isBookmarked);
    } finally {
      setLoading(false);
    }
  }, [projectId, isAuthenticated, isBookmarked]);

  return {
    isBookmarked,
    toggleBookmark,
    loading,
  };
}
