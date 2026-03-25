import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/server/lib/register";

const registerSchema = z.object({
  name: z.string().min(1, "Нэрээ оруулна уу"),
  email: z.string().email("Имэйл хаяг буруу байна"),
  password: z.string().min(8, "Нууц үг хамгийн багадаа 8 тэмдэгт"),
  organizationName: z.string().min(1, "Байгууллагын нэрээ оруулна уу"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Буруу өгөгдөл";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const result = await registerUser(parsed.data);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Серверийн алдаа. Дахин оролдоно уу." }, { status: 500 });
  }
}
