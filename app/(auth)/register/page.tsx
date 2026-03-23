"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { User, Mail, Lock, Building2, Sparkles } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-12">
      {/* Background — clean surface */}
      <div className="absolute inset-0 -z-10 bg-surface-secondary" />

      <div className="w-full max-w-[380px]">
        {/* Logo & heading */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-text-primary">Бүртгүүлэх</h1>
          <p className="mt-1 text-sm text-text-secondary">Шинэ бүртгэл үүсгэж эхэлнэ үү</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-6 shadow-sm">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <Input
              label="Нэр"
              type="text"
              placeholder="Таны нэр"
              icon={<User className="h-4 w-4" />}
              autoComplete="name"
            />

            <Input
              label="Имэйл"
              type="email"
              placeholder="та@жишээ.mn"
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />

            <Input
              label="Нууц үг"
              type="password"
              placeholder="Хамгийн багадаа 8 тэмдэгт"
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />

            <Input
              label="Нууц үг давтах"
              type="password"
              placeholder="Нууц үгээ давтана уу"
              icon={<Lock className="h-4 w-4" />}
              autoComplete="new-password"
            />

            <Input
              label="Байгууллагын нэр"
              type="text"
              placeholder="Таны байгууллагын нэр"
              icon={<Building2 className="h-4 w-4" />}
            />

            {/* Terms checkbox */}
            <div className="flex items-start gap-2.5 pt-1">
              <Checkbox id="terms" className="mt-0.5" />
              <label
                htmlFor="terms"
                className="text-sm text-text-secondary leading-snug cursor-pointer select-none"
              >
                <Link href="#" className="text-brand-600 hover:text-brand-700 transition-colors">
                  Үйлчилгээний нөхцөл
                </Link>
                -ийг зөвшөөрч байна
              </label>
            </div>

            <Button size="lg" className="w-full">
              Бүртгүүлэх
            </Button>
          </form>
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          Бүртгэлтэй юу?{" "}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
