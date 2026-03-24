import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../server/db/db";
import { users, tenantMembers } from "../server/db/schema";

async function seedUsers() {
  const passwordHash = await bcrypt.hash("password123", 10);

  const emails = [
    { email: "owner@goosaikhan.mn", name: "Владелец Гоо Сайхан" },
    { email: "admin@goosaikhan.mn", name: "Админ Гоо Сайхан" },
    { email: "owner@elektronik.mn", name: "Владелец Электроник" },
    { email: "staff@elektronik.mn", name: "Ажилтан Электроник" },
  ];

  for (const { email, name } of emails) {
    // Upsert user
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    let userId: string;
    if (existing) {
      userId = existing.id;
      console.log(`User ${email} already exists (${userId})`);
    } else {
      const [created] = await db.insert(users).values({ name, email, passwordHash }).returning();
      userId = created.id;
      console.log(`Created user ${email} (${userId})`);
    }

    // Link to tenant_member
    const member = await db.query.tenantMembers.findFirst({
      where: eq(tenantMembers.email, email),
    });

    if (member && !member.userId) {
      await db.update(tenantMembers).set({ userId }).where(eq(tenantMembers.id, member.id));
      console.log(`  Linked to tenant member (${member.tenantId})`);
    } else if (member?.userId) {
      console.log(`  Already linked to tenant (${member.tenantId})`);
    }
  }

  console.log("\nDone! Login with any email + password: password123");
  process.exit(0);
}

seedUsers().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
