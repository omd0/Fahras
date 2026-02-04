/**
 * Project Member Role Constants
 * Mirrors Laravel App\Constants\MemberRole
 */

export enum MemberRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
}

export const MEMBER_ROLE_VALUES = [
  MemberRole.LEAD,
  MemberRole.MEMBER,
] as const;

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  [MemberRole.LEAD]: 'Lead',
  [MemberRole.MEMBER]: 'Member',
};

/**
 * Check if a role is valid
 */
export function isValidMemberRole(role: unknown): role is MemberRole {
  return Object.values(MemberRole).includes(role as MemberRole);
}
