"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FadeIn } from "@/shared/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;

    if (password.length < 8) {
      setError("Нууц үг хамгийн багадаа 8 тэмдэгт байх ёстой");
      return;
    }

    if (!agreed) {
      setError("Үйлчилгээний нөхцлийг зөвшөөрнө үү");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("organizationName") as string,
          email: formData.get("email") as string,
          password,
          organizationName: formData.get("organizationName") as string,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        setError(data.error ?? "Бүртгэл амжилтгүй боллоо");
        return;
      }

      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError("Бүртгэл амжилттай. Нэвтэрнэ үү.");
        router.push("/login");
      } else {
        router.push("/analytics");
      }
    } catch {
      setLoading(false);
      setError("Серверийн алдаа. Дахин оролдоно уу.");
    }
  }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center bg-black px-6 py-12">
      {/* Ambient background */}
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[500px] w-[500px] rounded-full bg-white/[0.02] blur-[120px]" />
      <div className="pointer-events-none absolute bottom-1/3 left-1/3 h-[400px] w-[400px] rounded-full bg-white/[0.015] blur-[100px]" />

      {/* Decorative text */}
      <div className="pointer-events-none absolute top-16 right-12 select-none hidden lg:block">
        <span className="text-[120px] font-serif italic text-white/[0.06] leading-none rotate-12 inline-block">
          Elevate.
        </span>
      </div>

      <div className="relative z-10 w-full max-w-[540px]">
        {/* Logo */}
        <FadeIn>
          <div className="mb-10 text-center">
            <Link href="/" className="inline-block">
              <h2 className="text-5xl font-serif italic text-white tracking-tighter">Vela AI</h2>
              <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">
                The e-commerce curator
              </p>
            </Link>
          </div>
        </FadeIn>

        {/* Liquid glass card */}
        <FadeIn delay={0.1}>
          <div className="liquid-glass rounded-xl p-10 md:p-14 border border-white/[0.05]">
            <h1 className="text-3xl font-serif italic text-white tracking-tight">
              Begin your journey.
            </h1>
            <p className="mt-2 text-lg text-white/60 font-light tracking-tight">
              Set up your store assistant and scale with precision.
            </p>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-2xl bg-[#ffb4ab]/10 px-4 py-3 text-sm text-[#ffb4ab]">
                  {error}
                </div>
              )}

              <Input
                label="STORE NAME"
                name="organizationName"
                type="text"
                placeholder=""
                required
                className="bg-white text-black placeholder:text-black/30 h-14 rounded-full"
              />

              <Input
                label="CORPORATE EMAIL"
                name="email"
                type="email"
                placeholder=""
                autoComplete="email"
                required
                className="bg-white text-black placeholder:text-black/30 h-14 rounded-full"
              />

              <Input
                label="SECURE PASSWORD"
                name="password"
                type="password"
                placeholder=""
                autoComplete="new-password"
                required
                className="bg-white text-black placeholder:text-black/30 h-14 rounded-full"
              />

              <input type="hidden" name="name" value="" />

              {/* Terms checkbox */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  className="mt-0.5"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-sm leading-snug text-white/45"
                >
                  I agree to the{" "}
                  <Link
                    href="#"
                    className="text-white/70 transition-colors hover:text-white font-semibold"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="#"
                    className="text-white/70 transition-colors hover:text-white font-semibold"
                  >
                    Privacy Protocol
                  </Link>
                  .
                </label>
              </div>

              <Button size="xl" className="w-full mt-2" disabled={loading}>
                {loading ? "Creating..." : "CREATE ACCOUNT"}
              </Button>
            </form>

            {/* Separator + Login link */}
            <div className="mt-8 pt-6 border-t border-white/[0.05] text-center">
              <p className="text-sm text-white/40 font-light">
                Already a member?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-white transition-colors hover:text-white/80"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Security badges */}
        <FadeIn delay={0.2}>
          <div className="mt-8 flex items-center justify-center gap-8 text-[10px] text-white/20 uppercase tracking-[0.2em] font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              AES-256 Encryption
            </span>
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px]">public</span>
              Global Infrastructure
            </span>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
