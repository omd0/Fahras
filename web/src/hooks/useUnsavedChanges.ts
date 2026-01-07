import { useEffect, useCallback, useRef, useState } from 'react';
import { useLocation, useNavigate, useBlocker } from 'react-router-dom';

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
 * Custom hook for handling unsaved changes in forms
 * 
 * Provides navigation blocking when form has unsaved changes
 * and shows a confirmation dialog before navigating away.
 * 
 * @example
 * ```tsx
 * const [formData, setFormData] = useState(initialData);
 * const [isDirty, setIsDirty] = useState(false);
 * 
 * const {
 *   showDialog,
 *   confirmNavigation,
 *   cancelNavigation,
 *   pendingLocation
 * } = useUnsavedChanges({
 *   isDirty,
 *   message: 'You have unsaved changes. Are you sure you want to leave?',
 * });
 * 
 * // Track form changes
 * const handleChange = (field, value) => {
 *   setFormData({ ...formData, [field]: value });
 *   setIsDirty(true);
 * };
 * 
 * // Render confirmation dialog
 * <ConfirmDialog
 *   open={showDialog}
 *   title="Unsaved Changes"
 *   message="You have unsaved changes. Are you sure you want to leave?"
 *   onConfirm={confirmNavigation}
 *   onClose={cancelNavigation}
 * />
 * ```
 */
export const useUnsavedChanges = ({
  isDirty,
  onLeave,
  message = 'You have unsaved changes. Are you sure you want to leave?',
  enableBeforeUnload = true,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn => {
  const [showDialog, setShowDialog] = useState(false);
  const [pendingLocation, setPendingLocation] = useState<string | null>(null);
  const proceedRef = useRef(false);
  const navigate = useNavigate();

  // Use React Router's useBlocker to block navigation
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) => {
      // Don't block if form is clean or if we've already confirmed
      if (!isDirty || proceedRef.current) {
        return false;
      }
      
      // Block navigation if locations are different
      return currentLocation.pathname !== nextLocation.pathname;
    }
  );

  // Handle blocked navigation
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setPendingLocation(blocker.location.pathname);
      setShowDialog(true);
    }
  }, [blocker]);

  // Confirm navigation - proceed with blocked navigation
  const confirmNavigation = useCallback(() => {
    setShowDialog(false);
    proceedRef.current = true;
    
    // Call onLeave callback if provided
    if (onLeave) {
      onLeave();
    }
    
    // Proceed with the blocked navigation
    if (blocker.state === 'blocked') {
      blocker.proceed();
    }
    
    // Reset proceed flag after navigation
    setTimeout(() => {
      proceedRef.current = false;
      setPendingLocation(null);
    }, 100);
  }, [blocker, onLeave]);

  // Cancel navigation - stay on current page
  const cancelNavigation = useCallback(() => {
    setShowDialog(false);
    setPendingLocation(null);
    
    // Reset the blocker
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  }, [blocker]);

  // Handle browser beforeunload event (page refresh/close)
  useEffect(() => {
    if (!enableBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        // Modern browsers ignore custom messages and show their own
        // But we still need to set returnValue for compatibility
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, message, enableBeforeUnload]);

  return {
    showDialog,
    confirmNavigation,
    cancelNavigation,
    pendingLocation,
  };
};
