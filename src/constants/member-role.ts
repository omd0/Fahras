/**
 * Project Member Role Constants
 * Matches Laravel: api/app/Constants/MemberRole.php
 */

export enum MemberRole {
  LEAD = 'LEAD',
  MEMBER = 'MEMBER',
}

export const MEMBER_ROLE_LABELS: Record<MemberRole, string> = {
  [MemberRole.LEAD]: 'Lead',
  [MemberRole.MEMBER]: 'Member',
};

export function isValidMemberRole(role: string): role is MemberRole {
  return Object.values(MemberRole).includes(role as MemberRole);
}
