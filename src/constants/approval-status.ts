/**
 * Approval Status Constants
 * Matches Laravel: api/app/Constants/ApprovalStatus.php
 */

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  HIDDEN = 'hidden',
  NEEDS_REVISION = 'needs_revision',
}

export const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  [ApprovalStatus.PENDING]: 'Pending',
  [ApprovalStatus.APPROVED]: 'Approved',
  [ApprovalStatus.REJECTED]: 'Rejected',
  [ApprovalStatus.HIDDEN]: 'Hidden',
  [ApprovalStatus.NEEDS_REVISION]: 'Needs Revision',
};

export function isValidApprovalStatus(status: string): status is ApprovalStatus {
  return Object.values(ApprovalStatus).includes(status as ApprovalStatus);
}
