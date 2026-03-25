"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FadeIn } from "@/shared/components/ui";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-black">
          <p className="text-white/40">Ачааллаж байна...</p>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

    if (password.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Алдаа гарлаа");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  }

  if (!token || !email) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-black px-6">
        <div className="text-center">
          <p className="text-white/50">Буруу линк байна.</p>
          <Link href="/login" className="mt-4 inline-block text-sm text-white underline">
            Нэвтрэх хуудас руу буцах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-black px-6">
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[150px]" />

      <div className="relative z-10 w-full max-w-md">
        <FadeIn>
          <div className="mb-12 text-center">
            <Link href="/" className="inline-block">
              <h2 className="text-6xl font-headline italic text-white tracking-tighter">Vela AI</h2>
            </Link>
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="liquid-glass rounded-xl p-10 md:p-12 border border-white/[0.05]">
            {success ? (
              <div className="text-center">
                <span className="material-symbols-outlined text-[48px] text-emerald-400 mb-4 block">
                  check_circle
                </span>
                <h1 className="text-2xl font-headline italic text-white">Нууц үг шинэчлэгдлээ</h1>
                <p className="mt-3 text-sm text-white/50">Шинэ нууц үгээ ашиглан нэвтэрнэ үү.</p>
                <Link
                  href="/login"
                  className="mt-6 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-all hover:bg-white/90"
                >
                  Нэвтрэх
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-headline italic text-white tracking-tight">
                  Шинэ нууц үг
                </h1>
                <p className="mt-2 text-sm text-white/50 tracking-tight font-light">
                  Шинэ нууц үгээ тохируулна уу
                </p>

                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-2xl bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
                      {error}
                    </div>
                  )}

                  <Input
                    label="ШИНЭ НУУЦ ҮГ"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    suffix={<span className="material-symbols-outlined text-[20px]">lock</span>}
                    required
                    autoComplete="new-password"
                  />

                  <Input
                    label="НУУЦ ҮГ ДАВТАХ"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    suffix={<span className="material-symbols-outlined text-[20px]">lock</span>}
                    required
                    autoComplete="new-password"
                  />

                  <Button
                    size="xl"
                    className="w-full mt-2"
                    disabled={loading || !password || !confirmPassword}
                  >
                    {loading ? "Шинэчилж байна..." : "Нууц үг шинэчлэх"}
                  </Button>
                </form>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
