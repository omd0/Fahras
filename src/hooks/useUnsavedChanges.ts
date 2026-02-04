'use client';

import { useEffect, useCallback, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface UseUnsavedChangesOptions {
  /** Whether the form has unsaved changes */
  isDirty: boolean;
  /** Callback when user confirms leaving with unsaved changes */
  onLeave?: () => void;
  /** Custom warning message */
  message?: string;
  /** Enable browser warning on page refresh/close */
  enableBeforeUnload?: boolean;
}

export interface UseUnsavedChangesReturn {
  /** Whether the confirmation dialog should be shown */
  showDialog: boolean;
  /** Confirm navigation and allow leaving the page */
  confirmNavigation: () => void;
  /** Cancel navigation and stay on the page */
  cancelNavigation: () => void;
  /** Current path user is trying to navigate to */
  pendingLocation: string | null;
}

/**
 * Custom hook for handling unsaved changes in forms (Next.js App Router).
 *
 * Unlike React Router's useBlocker, Next.js doesn't provide navigation blocking.
 * This hook intercepts browser back/forward and beforeunload events.
 * For in-app links, wrap your navigation calls with `guardedNavigate()`.
 */
export const useUnsavedChanges = ({
  isDirty,
  onLeave,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  enableBeforeUnload = true,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn => {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<string | null>(null);
  const router = useRouter();
  const isDirtyRef = useRef(isDirty);

  // Keep ref in sync
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  // Confirm navigation — proceed with pending navigation
  const confirmNavigation = useCallback(() => {
    setShowDialog(false);
    if (onLeave) onLeave();

    if (pendingLocation) {
      router.push(pendingLocation);
    }
    setPendingLocation(null);
  }, [pendingLocation, router, onLeave]);

  // Cancel navigation — stay on current page
  const cancelNavigation = useCallback(() => {
    setShowDialog(false);
    setPendingLocation(null);
  }, []);

  // Handle browser beforeunload (refresh/close tab)
  useEffect(() => {
    if (!enableBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [message, enableBeforeUnload]);

  // Intercept browser back/forward button via popstate
  useEffect(() => {
    if (!isDirty) return;

    // Push a duplicate state so we can intercept back
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      if (isDirtyRef.current) {
        // Re-push to prevent navigation
        window.history.pushState(null, '', window.location.href);
        setShowDialog(true);
        setPendingLocation(null); // popstate doesn't give us destination
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isDirty]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    pendingLocation,
  };
};
