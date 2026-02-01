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

  // Initialize bookmark status
  useEffect(() => {
    if (isAuthenticated) {
      // For authenticated users, check via API
      apiService
        .isProjectBookmarked(projectId)
        .then((response) => {
          setIsBookmarked(response.is_bookmarked);
        })
        .catch((error) => {
          console.error('Error checking bookmark status:', error);
        });
    } else {
      // For guests, check cookie
      setIsBookmarked(isGuestBookmarked(projectId));
    }
  }, [projectId, isAuthenticated]);

  const toggleBookmark = useCallback(async () => {
    setLoading(true);
    try {
      if (isAuthenticated) {
        // Use API for authenticated users
        if (isBookmarked) {
          await apiService.unbookmarkProject(projectId);
          setIsBookmarked(false);
        } else {
          await apiService.bookmarkProject(projectId);
          setIsBookmarked(true);
        }
      } else {
        // Use cookies for guests
        if (isBookmarked) {
          removeGuestBookmark(projectId);
          setIsBookmarked(false);
        } else {
          addGuestBookmark(projectId);
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert state on error
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
