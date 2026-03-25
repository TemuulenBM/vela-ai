import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { eq, and } from "drizzle-orm";
import { db } from "@/server/db/db";
import { users, verificationTokens } from "@/server/db/schema";

export async function POST(request: Request) {
  try {
    const { token, email, password } = (await request.json()) as {
      token?: string;
      email?: string;
      password?: string;
    };

    if (!token || !email || !password) {
      return NextResponse.json({ error: "Бүх талбарыг бөглөнө үү" }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find and validate token
    const record = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.identifier, normalizedEmail),
        eq(verificationTokens.token, token),
      ),
    });

    if (!record) {
      return NextResponse.json(
        { error: "Линк буруу эсвэл хугацаа дууссан байна" },
        { status: 400 },
      );
    }

    if (new Date() > record.expires) {
      // Clean up expired token
      await db
        .delete(verificationTokens)
        .where(
          and(
            eq(verificationTokens.identifier, normalizedEmail),
            eq(verificationTokens.token, token),
          ),
        );
      return NextResponse.json(
        { error: "Линкний хугацаа дууссан байна. Дахин хүсэлт илгээнэ үү." },
        { status: 400 },
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    const [updated] = await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.email, normalizedEmail))
      .returning({ id: users.id });

    if (!updated) {
      return NextResponse.json({ error: "Хэрэглэгч олдсонгүй" }, { status: 404 });
    }

    // Delete used token
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, normalizedEmail),
          eq(verificationTokens.token, token),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Алдаа гарлаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
