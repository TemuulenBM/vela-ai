"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Separator } from "@/shared/components/ui/separator";
import { Mail, Lock, Sparkles } from "lucide-react";

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
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      {/* Background — clean surface, no blobs or dots */}
      <div className="absolute inset-0 -z-10 bg-surface-secondary" />

      <div className="w-full max-w-[380px]">
        {/* Logo & heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Тавтай морил</h1>
          <p className="mt-1 text-sm text-text-secondary">Бүртгэлдээ нэвтэрнэ үү</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-6 shadow-sm">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-[var(--radius-md)] bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

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
              placeholder="Нууц үгээ оруулна уу"
              icon={<Lock className="h-4 w-4" />}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-end">
              <Link
                href="#"
                className="text-xs text-brand-600 hover:text-brand-700 transition-colors"
              >
                Нууц үгээ мартсан?
              </Link>
            </div>

            <Button size="lg" className="w-full" disabled={loading}>
              {loading ? "Нэвтэрж байна..." : "Нэвтрэх"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-primary px-3 text-xs text-text-tertiary">
              эсвэл
            </span>
          </div>

          {/* Google login */}
          <Button variant="secondary" size="lg" className="w-full">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google-ээр нэвтрэх
          </Button>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Бүртгэл байхгүй юу?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </div>
  );
}
