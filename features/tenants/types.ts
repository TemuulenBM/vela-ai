export type PlanType = "free" | "starter" | "growth" | "pro";
export type MemberRole = "member" | "owner" | "admin";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: PlanType;
  settings: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantMember {
  id: string;
  tenantId: string;
  email: string;
  userId: string | null;
  role: MemberRole;
  lastLoginAt: Date | null;
  createdAt: Date;
}
