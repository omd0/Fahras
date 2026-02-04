/**
 * Project Advisor Role Constants
 * Mirrors Laravel App\Constants\AdvisorRole
 */

export enum AdvisorRole {
  MAIN = 'MAIN',
  CO_ADVISOR = 'CO_ADVISOR',
  REVIEWER = 'REVIEWER',
}

export const ADVISOR_ROLE_VALUES = [
  AdvisorRole.MAIN,
  AdvisorRole.CO_ADVISOR,
  AdvisorRole.REVIEWER,
] as const;

export const ADVISOR_ROLE_LABELS: Record<AdvisorRole, string> = {
  [AdvisorRole.MAIN]: 'Main Advisor',
  [AdvisorRole.CO_ADVISOR]: 'Co-Advisor',
  [AdvisorRole.REVIEWER]: 'Reviewer',
};

/**
 * Check if a role is valid
 */
export function isValidAdvisorRole(role: unknown): role is AdvisorRole {
  return Object.values(AdvisorRole).includes(role as AdvisorRole);
}
