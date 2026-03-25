"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { FadeIn } from "@/shared/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const result = await signIn("credentials", {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Имэйл эсвэл нууц үг буруу байна");
    } else {
      router.push("/analytics");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-black px-6">
      {/* Ambient background */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-white/[0.02] blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[500px] rounded-full bg-white/[0.015] blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <FadeIn>
          <div className="mb-12 text-center">
            <Link href="/" className="inline-block">
              <h2 className="text-6xl font-headline italic text-white tracking-tighter">Vela AI</h2>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                AI борлуулалтын туслах
              </p>
            </Link>
          </div>
        </FadeIn>

        {/* Card */}
        <FadeIn delay={0.1}>
          <div className="liquid-glass rounded-xl p-10 md:p-12 border border-white/[0.05]">
            <h1 className="text-4xl font-headline italic text-white tracking-tight">
              Тавтай морил
            </h1>
            <p className="mt-2 text-sm text-white/50 tracking-tight font-light">
              AI борлуулалтын удирдлагад нэвтрэх
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
                  {error}
                </div>
              )}

              <Input
                label="ИМЭЙЛ ХАЯГ"
                name="email"
                type="email"
                placeholder="curator@vela.ai"
                suffix={
                  <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                }
                autoComplete="email"
                required
              />

              <Input
                label="НУУЦ ҮГ"
                labelRight={
                  <Link
                    href="#"
                    className="text-[10px] font-semibold uppercase tracking-widest text-white/40 hover:text-white/70 transition-colors"
                  >
                    Мартсан?
                  </Link>
                }
                name="password"
                type="password"
                placeholder="••••••••"
                suffix={<span className="material-symbols-outlined text-[20px]">lock</span>}
                autoComplete="current-password"
                required
              />

              <Button size="xl" className="w-full mt-2" disabled={loading}>
                {loading ? "Нэвтэрч байна..." : "Нэвтрэх"}
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-white/40 font-light">
              Шинэ хэрэглэгч?{" "}
              <Link
                href="/register"
                className="font-semibold text-white transition-colors hover:text-white/80"
              >
                Бүртгүүлэх
              </Link>
            </p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
