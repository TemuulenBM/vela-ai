"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FadeIn } from "@/shared/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Алдаа гарлаа");
      } else {
        setSent(true);
      }
    } catch {
      setError("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
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
            {sent ? (
              <div className="text-center">
                <span className="material-symbols-outlined text-[48px] text-emerald-400 mb-4 block">
                  mark_email_read
                </span>
                <h1 className="text-2xl font-headline italic text-white">Имэйл илгээгдлээ</h1>
                <p className="mt-3 text-sm text-white/50">
                  Нууц үг сэргээх линк <strong className="text-white">{email}</strong> хаяг руу
                  илгээгдлээ. Имэйлээ шалгана уу.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-block text-sm font-semibold text-white underline decoration-white/30 hover:decoration-white/60 transition-colors"
                >
                  Нэвтрэх хуудас руу буцах
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-headline italic text-white tracking-tight">
                  Нууц үг сэргээх
                </h1>
                <p className="mt-2 text-sm text-white/50 tracking-tight font-light">
                  Бүртгэлтэй имэйл хаягаа оруулна уу
                </p>

                <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
                  {error && (
                    <div className="rounded-2xl bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
                      {error}
                    </div>
                  )}

                  <Input
                    label="ИМЭЙЛ ХАЯГ"
                    type="email"
                    placeholder="curator@vela.ai"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    suffix={
                      <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                    }
                    required
                  />

                  <Button size="xl" className="w-full mt-2" disabled={loading || !email}>
                    {loading ? "Илгээж байна..." : "Линк илгээх"}
                  </Button>
                </form>

                <p className="mt-8 text-center text-sm text-white/40 font-light">
                  <Link
                    href="/login"
                    className="font-semibold text-white transition-colors hover:text-white/80"
                  >
                    Нэвтрэх хуудас руу буцах
                  </Link>
                </p>
              </>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
