import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/server/db/db";
import { users, tenants, tenantMembers, subscriptions } from "@/server/db/schema";

// ---------------------------------------------------------------------------
// Slug generation — Mongolian-safe
// ---------------------------------------------------------------------------

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u0400-\u04ff-]/g, "") // keep latin, cyrillic, digits, hyphens
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateSlug(orgName: string): string {
  const base = slugify(orgName) || "store";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base}-${suffix}`;
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  organizationName: string;
};

type RegisterResult = { success: true } | { error: string };

export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  // 1. Check duplicate email
  const existing = await db.query.users.findFirst({
    where: eq(users.email, input.email.toLowerCase()),
  });

  if (existing) {
    return { error: "Энэ имэйл хаяг бүртгэлтэй байна" };
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(input.password, 12);

  // 3. Sequential inserts (neon-http does not support transactions)
  let userId: string | undefined;
  let tenantId: string | undefined;

  try {
    // Create user
    const [user] = await db
      .insert(users)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
      })
      .returning({ id: users.id });
    userId = user.id;

    // Create tenant
    const [tenant] = await db
      .insert(tenants)
      .values({
        name: input.organizationName,
        slug: generateSlug(input.organizationName),
        plan: "free",
      })
      .returning({ id: tenants.id });
    tenantId = tenant.id;

    // Link user to tenant as owner
    await db.insert(tenantMembers).values({
      tenantId: tenant.id,
      email: input.email.toLowerCase(),
      userId: user.id,
      role: "owner",
    });

    // Create free subscription (1 year)
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    await db.insert(subscriptions).values({
      tenantId: tenant.id,
      plan: "free",
      status: "active",
      periodStart: now,
      periodEnd: oneYearLater,
    });

    return { success: true };
  } catch (err) {
    // Cleanup on partial failure
    if (tenantId) {
      await db
        .delete(tenantMembers)
        .where(eq(tenantMembers.tenantId, tenantId))
        .catch(() => {});
      await db
        .delete(subscriptions)
        .where(eq(subscriptions.tenantId, tenantId))
        .catch(() => {});
      await db
        .delete(tenants)
        .where(eq(tenants.id, tenantId))
        .catch(() => {});
    }
    if (userId) {
      await db
        .delete(users)
        .where(eq(users.id, userId))
        .catch(() => {});
    }

    if (err instanceof Error && err.message.includes("unique")) {
      return { error: "Энэ имэйл хаяг бүртгэлтэй байна" };
    }

    console.error("Registration failed:", err);
    return { error: "Бүртгэл амжилтгүй боллоо. Дахин оролдоно уу." };
  }
}
