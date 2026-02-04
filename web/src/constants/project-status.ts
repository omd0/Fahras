/**
 * Project Status Constants
 * Mirrors Laravel App\Constants\ProjectStatus
 */

export enum ProjectStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export const PROJECT_STATUS_VALUES = [
  ProjectStatus.DRAFT,
  ProjectStatus.SUBMITTED,
  ProjectStatus.UNDER_REVIEW,
  ProjectStatus.APPROVED,
  ProjectStatus.REJECTED,
  ProjectStatus.COMPLETED,
] as const;

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  [ProjectStatus.DRAFT]: 'Draft',
  [ProjectStatus.SUBMITTED]: 'Submitted',
  [ProjectStatus.UNDER_REVIEW]: 'Under Review',
  [ProjectStatus.APPROVED]: 'Approved',
  [ProjectStatus.REJECTED]: 'Rejected',
  [ProjectStatus.COMPLETED]: 'Completed',
};

/**
 * Check if a status is valid
 */
export function isValidProjectStatus(status: unknown): status is ProjectStatus {
  return Object.values(ProjectStatus).includes(status as ProjectStatus);
}
