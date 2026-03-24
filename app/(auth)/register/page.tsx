"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { FadeIn } from "@/shared/components/ui";
import { User, Mail, Lock, Building2, Sparkles } from "lucide-react";
import { AuthShowcasePanel } from "../components/auth-showcase-panel";

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
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Нууц үг таарахгүй байна");
      return;
    }

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
          name: formData.get("name") as string,
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

      // Auto-login after registration
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
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[2fr_3fr]">
      {/* Left panel — Form */}
      <div className="flex items-center justify-center px-6 py-12 lg:justify-end lg:pr-16">
        <div className="w-full max-w-[380px]">
          {/* Logo & heading — left-aligned */}
          <FadeIn>
            <Link href="/" className="mb-8 inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand-600">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold text-text-primary">Vela AI</span>
            </Link>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Бүртгүүлэх</h1>
            <p className="mt-1 text-sm text-text-secondary">Шинэ бүртгэл үүсгэж эхэлнэ үү</p>
          </FadeIn>

          {/* Form — no card border */}
          <FadeIn delay={0.1}>
            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-[var(--radius-md)] border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                  {error}
                </div>
              )}

              <Input
                label="Нэр"
                name="name"
                type="text"
                placeholder="Таны нэр"
                icon={<User className="h-4 w-4" />}
                autoComplete="name"
                required
              />

              <Input
                label="Имэйл"
                name="email"
                type="email"
                placeholder="та@жишээ.mn"
                icon={<Mail className="h-4 w-4" />}
                autoComplete="email"
                required
              />

              <Input
                label="Нууц үг"
                name="password"
                type="password"
                placeholder="Хамгийн багадаа 8 тэмдэгт"
                icon={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
                required
              />

              <Input
                label="Нууц үг давтах"
                name="confirmPassword"
                type="password"
                placeholder="Нууц үгээ давтана уу"
                icon={<Lock className="h-4 w-4" />}
                autoComplete="new-password"
                required
              />

              <Input
                label="Байгууллагын нэр"
                name="organizationName"
                type="text"
                placeholder="Таны байгууллагын нэр"
                icon={<Building2 className="h-4 w-4" />}
                required
              />

              {/* Terms checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <Checkbox
                  id="terms"
                  className="mt-0.5"
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked === true)}
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer select-none text-sm leading-snug text-text-secondary"
                >
                  <Link href="#" className="text-brand-600 transition-colors hover:text-brand-700">
                    Үйлчилгээний нөхцөл
                  </Link>
                  -ийг зөвшөөрч байна
                </label>
              </div>

              <Button size="lg" className="w-full" disabled={loading}>
                {loading ? "Бүртгүүлж байна..." : "Бүртгүүлэх"}
              </Button>
            </form>
          </FadeIn>

          {/* Login link */}
          <FadeIn delay={0.15}>
            <p className="mt-8 text-sm text-text-secondary">
              Бүртгэлтэй юу?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-600 transition-colors hover:text-brand-700"
              >
                Нэвтрэх
              </Link>
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Right panel — Showcase */}
      <AuthShowcasePanel />
    </div>
  );
}
