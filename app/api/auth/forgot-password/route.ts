import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { Resend } from "resend";
import { db } from "@/server/db/db";
import { users, verificationTokens } from "@/server/db/schema";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Имэйл хаяг шаардлагатай" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await db.query.users.findFirst({
      where: eq(users.email, normalizedEmail),
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete existing tokens for this email
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalizedEmail));

    // Save token
    await db.insert(verificationTokens).values({
      identifier: normalizedEmail,
      token,
      expires,
    });

    // Send email
    const resetUrl = `${process.env.AUTH_URL}/reset-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`;

    await getResend().emails.send({
      from: "Vela AI <noreply@vela.mn>",
      to: normalizedEmail,
      subject: "Нууц үг сэргээх — Vela AI",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 16px;">Нууц үг сэргээх</h1>
          <p style="color: #666; margin-bottom: 24px;">
            Та нууц үг сэргээх хүсэлт илгээсэн байна. Доорх товч дээр дарж шинэ нууц үг тохируулна уу.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #000; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Нууц үг сэргээх
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            Энэ линк 1 цагийн дотор хүчинтэй. Хэрэв та энэ хүсэлтийг илгээгээгүй бол энэ имэйлийг үл тоомсорлоно уу.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Алдаа гарлаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
