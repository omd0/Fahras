/**
 * Project Helper Utilities
 *
 * Centralized utility functions for project status and approval status handling.
 * These functions provide consistent color coding and labeling across the application.
 */

/**
 * Maps project status to MUI Chip color variants
 * @param status - The project status string
 * @returns MUI color variant for Chip component
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'submitted':
      return 'warning';
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'under_review':
      return 'info';
    case 'completed':
      return 'success';
    case 'draft':
      return 'default';
    default:
      return 'default';
  }
};

/**
 * Maps project status to human-readable labels
 * @param status - The project status string
 * @returns Human-readable status label
 */
export const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'submitted':
      return 'Submitted';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    case 'under_review':
      return 'Under Review';
    case 'completed':
      return 'Completed';
    case 'draft':
      return 'Draft';
    default:
      return status;
  }
};

/**
 * Maps admin approval status to MUI Chip color variants
 * @param status - The admin approval status string
 * @returns MUI color variant for Chip component
 */
export const getApprovalStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'approved':
      return 'success';
    case 'hidden':
    case 'rejected':
      return 'error';
    case 'pending':
    default:
      return 'warning';
  }
};

/**
 * Maps admin approval status to human-readable labels
 * @param status - The admin approval status string
 * @returns Human-readable approval status label
 */
export const getApprovalStatusLabel = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'Approved';
    case 'hidden':
      return 'Hidden';
    case 'pending':
      return 'Pending';
    default:
      return status;
  }
};

/**
 * Formats a date string or Date object to a localized date string
 * @param date - The date to format (string or Date object)
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
