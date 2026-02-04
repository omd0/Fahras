/**
 * Approval Status Constants
 * Mirrors Laravel App\Constants\ApprovalStatus
 */

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
  NEEDS_REVISION = 'needs_revision',
}

export const APPROVAL_STATUS_VALUES = [
  ApprovalStatus.PENDING,
  ApprovalStatus.APPROVED,
  ApprovalStatus.REJECTED,
  ApprovalStatus.HIDDEN,
  ApprovalStatus.NEEDS_REVISION,
] as const;

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'Pending',
  [ApprovalStatus.APPROVED]: 'Approved',
  [ApprovalStatus.REJECTED]: 'Rejected',
  [ApprovalStatus.HIDDEN]: 'Hidden',
  [ApprovalStatus.NEEDS_REVISION]: 'Needs Revision',
};

/**
 * Check if a status is valid
 */
export function isValidApprovalStatus(status: unknown): status is ApprovalStatus {
  return Object.values(ApprovalStatus).includes(status as ApprovalStatus);
}
