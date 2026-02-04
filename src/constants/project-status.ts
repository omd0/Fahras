/**
 * Project Status Constants
 * Matches Laravel: api/app/Constants/ProjectStatus.php
 */

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.SUBMITTED]: 'Submitted',
  [ProjectStatus.UNDER_REVIEW]: 'Under Review',
  [ProjectStatus.APPROVED]: 'Approved',
  [ProjectStatus.REJECTED]: 'Rejected',
  [ProjectStatus.COMPLETED]: 'Completed',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'default',
  [ProjectStatus.SUBMITTED]: 'info',
  [ProjectStatus.UNDER_REVIEW]: 'warning',
  [ProjectStatus.APPROVED]: 'success',
  [ProjectStatus.REJECTED]: 'error',
  [ProjectStatus.COMPLETED]: 'success',
};

export function isValidProjectStatus(status: string): status is ProjectStatus {
  return Object.values(ProjectStatus).includes(status as ProjectStatus);
}
