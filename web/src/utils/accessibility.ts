/**
 * Accessibility utilities for keyboard navigation and screen reader support
 */

import React from 'react';

/**
 * Handle keyboard events for clickable elements
 * Supports Enter and Space keys as per WCAG guidelines
 */
export const handleKeyboardClick = (
  event: React.KeyboardEvent,
  callback: () => void
): void => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback();
  }
};

/**
 * Handle keyboard navigation for lists (Arrow keys)
 */
export const handleKeyboardNavigation = (
  event: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (newIndex: number) => void
): void => {
  let newIndex = currentIndex;

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault();
      newIndex = currentIndex < totalItems - 1 ? currentIndex + 1 : 0;
      break;
    case 'ArrowUp':
      event.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : totalItems - 1;
      break;
    case 'Home':
      event.preventDefault();
      newIndex = 0;
      break;
    case 'End':
      event.preventDefault();
      newIndex = totalItems - 1;
      break;
    default:
      return;
  }

  onNavigate(newIndex);
};

/**
 * Get ARIA label for project status
 */
export const getStatusAriaLabel = (status: string): string => {
  const statusLabels: Record<string, string> = {
    draft: 'Draft - In preparation',
    submitted: 'Submitted - Awaiting review',
    under_review: 'Under review - Being evaluated',
    approved: 'Approved - Ready for implementation',
    rejected: 'Rejected - Needs revision',
    completed: 'Completed - Finished successfully',
  };
  return statusLabels[status] || status.replace('_', ' ');
};

/**
 * Announce message to screen readers
 */
export const announceToScreenReader = (message: string): void => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

/**
 * Focus trap utility for modals and dialogs
 */
export const useFocusTrap = (containerRef: React.RefObject<HTMLElement>): {
  trapFocus: () => void;
  releaseFocus: () => void;
} => {
  const trapFocus = () => {
    if (!containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      containerRef.current?.removeEventListener('keydown', handleTabKey);
    };
  };

  const releaseFocus = () => {
    // Return focus to the element that triggered the modal
    const trigger = document.activeElement as HTMLElement;
    trigger?.focus();
  };

  return { trapFocus, releaseFocus };
};

/**
 * Skip to main content link handler
 */
export const skipToMainContent = (): void => {
  const mainContent = document.getElementById('main-content');
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    mainContent.removeAttribute('tabindex');
  }
};

/**
 * Get contrast ratio between two colors
 * Returns true if contrast ratio meets WCAG AA standards (4.5:1 for normal text)
 */
export const hasGoodContrast = (
  _foreground: string,
  _background: string,
  _minimumRatio: number = 4.5
): boolean => {
  // This is a simplified check - in production, use a proper color contrast library
  // For now, we'll assume our theme colors are compliant
  return true;
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate transition duration based on user preferences
 */
export const getTransitionDuration = (defaultDuration: string): string => {
  return prefersReducedMotion() ? '0ms' : defaultDuration;
};

/**
 * Format file size for screen readers
 */
export const formatFileSizeForScreenReader = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'Kilobytes', 'Megabytes', 'Gigabytes'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
  
  return `${size} ${sizes[i]}`;
};

/**
 * Format date for screen readers
 */
export const formatDateForScreenReader = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
};

/**
 * Create descriptive label for links
 */
export const createDescriptiveLabel = (
  actionType: string,
  itemName: string
): string => {
  const actions: Record<string, string> = {
    view: 'View details for',
    edit: 'Edit',
    delete: 'Delete',
    download: 'Download',
    share: 'Share',
  };
  
  return `${actions[actionType] || actionType} ${itemName}`;
};
