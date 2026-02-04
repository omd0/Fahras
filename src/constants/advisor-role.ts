/**
 * Project Advisor Role Constants
 * Matches Laravel: api/app/Constants/AdvisorRole.php
 */

export enum AdvisorRole {
  MAIN = 'MAIN',
  CO_ADVISOR = 'CO_ADVISOR',
  REVIEWER = 'REVIEWER',
}

export const ADVISOR_ROLE_LABELS: Record<AdvisorRole, string> = {
  [AdvisorRole.MAIN]: 'Main Advisor',
  [AdvisorRole.CO_ADVISOR]: 'Co-Advisor',
  [AdvisorRole.REVIEWER]: 'Reviewer',
};

export function isValidAdvisorRole(role: string): role is AdvisorRole {
  return Object.values(AdvisorRole).includes(role as AdvisorRole);
}
