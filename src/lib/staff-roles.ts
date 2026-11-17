export const staffRoles = ["AUDITOR", "SUPPORT", "FULFILLMENT", "FINANCE"] as const;
export type StaffRole = (typeof staffRoles)[number];

export function isStaffRole(value: unknown): value is StaffRole {
  return staffRoles.some((role) => role === value);
}

export function staffGrantKey(id: string, role: StaffRole = "AUDITOR") {
  return `staff_${role.toLowerCase()}:${id}`;
}

export function hasStaffGrant(value: string | undefined, role: StaffRole) {
  return value?.startsWith(`${role}:`) === true;
}
