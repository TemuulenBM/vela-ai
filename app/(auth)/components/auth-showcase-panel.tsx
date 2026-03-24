"use client";

import { Sparkles } from "lucide-react";
import { FadeIn } from "@/shared/components/ui";

const chatMessages = [
  { role: "user" as const, text: "Cashmere цамцны хэмжээ яаж сонгох вэ?" },
  {
    role: "assistant" as const,
    text: "Gobi Cashmere эрэгтэй V хүзүүтэй цамц L хэмжээтэй байна. 289,000₮-ээр худалдаалж байна.",
  },
  { role: "user" as const, text: "Захиалга өгье!" },
  {
    role: "assistant" as const,
    text: "Захиалга амжилттай! Дугаар: #VL-20240323-0847. QPay-ээр төлнө үү.",
  },
];

export function AuthShowcasePanel() {
  return (
    <div className="relative hidden overflow-hidden bg-surface-secondary lg:flex lg:flex-col lg:items-center lg:justify-center">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-brand-400/[0.06] blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-[400px] w-[400px] rounded-full bg-brand-400/[0.04] blur-[80px]" />

      {/* Dot grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--color-text-primary) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Grain texture */}
      <div className="grain pointer-events-none absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[360px] px-8">
        <FadeIn delay={0.2}>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
              AI борлуулалтын туслах
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary max-w-[45ch]">
              Хэрэглэгч бүртэй байнгын холбоотой, ухаалаг хариулттай, борлуулалтыг нэмэгдүүлнэ.
            </p>
          </div>
        </FadeIn>

        {/* Chat preview */}
        <FadeIn delay={0.3}>
          <div className="rounded-[var(--radius-xl)] border border-border-default bg-surface-primary p-4 shadow-md">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-[var(--radius-sm)] bg-brand-600">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-[13px] font-semibold text-text-primary">Vela AI</span>
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-green-500" />
            </div>

            <div className="flex flex-col gap-2">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.role === "user"
                      ? "ml-8 rounded-[var(--radius-lg)] rounded-br-[var(--radius-sm)] bg-brand-50 px-3 py-2"
                      : "mr-8 rounded-[var(--radius-lg)] rounded-bl-[var(--radius-sm)] bg-surface-tertiary px-3 py-2"
                  }
                >
                  <p className="text-[12px] leading-relaxed text-text-primary">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.4}>
          <div className="mt-6 flex divide-x divide-border-default">
            {[
              { label: "Яриа/сар", value: "1,200+" },
              { label: "Хөрвүүлэлт", value: "3.2%" },
              { label: "Хурд", value: "<2с" },
            ].map((stat) => (
              <div key={stat.label} className="flex-1 px-3 first:pl-0 last:pr-0">
                <p className="text-lg font-semibold tracking-tight text-text-primary">
                  {stat.value}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wider text-text-tertiary">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
