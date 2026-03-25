"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";

const steps = [
  {
    number: 1,
    title: "Каталог оруулах",
    description:
      "Бүтээгдэхүүний мэдээллээ CSV файл, API, эсвэл гараар оруулна. Vela AI бүх форматыг дэмжинэ.",
    icon: "upload_file",
  },
  {
    number: 2,
    title: "AI суралцах",
    description:
      "Манай AI таны каталогоос embedding үүсгэж, бараа бүрийн мэдээлэл, шинж чанар, үнийг бүрэн ойлгоно.",
    icon: "psychology",
  },
  {
    number: 3,
    title: "Борлуулалт эхлэх",
    description:
      "Chat widget таны вэбсайтад нэмэгдэж, худалдан авагчдад 24/7 мэргэжлийн зөвлөгөө өгч эхэлнэ.",
    icon: "rocket_launch",
  },
];

function StepMockup({ step }: { step: number }) {
  if (step === 1) {
    return (
      <div className="glass-card rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-3 text-white/40 text-xs">
          <span className="material-symbols-outlined text-[16px]">description</span>
          products.csv
        </div>
        <div className="space-y-2">
          {["Кашемир цамц — ₮189,000", "Ноосон малгай — ₮45,000", "Арьсан цүнх — ₮320,000"].map(
            (item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15, duration: 0.3 }}
                className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-2"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400/60" />
                <span className="text-xs text-white/50">{item}</span>
              </motion.div>
            ),
          )}
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/40">Embedding үүсгэж байна...</span>
          <span className="text-xs text-emerald-400/80">87%</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-white/20 to-white/40"
            initial={{ width: "0%" }}
            animate={{ width: "87%" }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {["Бүтээгдэхүүн", "Шинж чанар", "Үнэ"].map((label, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2 }}
              className="rounded-lg bg-white/[0.03] p-2 text-center"
            >
              <span className="text-[10px] text-white/30">{label}</span>
              <div className="mt-1 text-xs text-white/60 font-display font-semibold">
                {["324", "1,280", "₮89K"][i]}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-[12px] text-white/60">smart_toy</span>
        </div>
        <span className="text-xs text-white/40">Vela AI</span>
      </div>
      {[
        "Сайн байна уу! Юу хайж байна вэ?",
        "Кашемир цамц хэдээс эхлэх вэ?",
        "₮189,000-с эхлэнэ. Өнгө, хэмжээ сонгох уу?",
      ].map((msg, i) => (
        <motion.div
          key={msg}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.3, duration: 0.3 }}
          className={`rounded-xl px-3 py-2 text-xs max-w-[85%] ${
            i === 1 ? "ml-auto bg-white/10 text-white/60" : "bg-white/[0.04] text-white/50"
          }`}
        >
          {msg}
        </motion.div>
      ))}
    </div>
  );
}

export function HowItWorksDemo() {
  const [active, setActive] = useState(0);

  const advance = useCallback(() => {
    setActive((prev) => (prev + 1) % steps.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(advance, 4000);
    return () => clearInterval(timer);
  }, [advance, active]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-8 md:gap-12 items-start">
      {/* Step indicators */}
      <div className="flex md:flex-col gap-3 md:gap-0 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
        {steps.map((step, i) => (
          <button
            key={step.number}
            onClick={() => setActive(i)}
            className="flex items-center gap-3 md:gap-4 text-left shrink-0 group cursor-pointer"
          >
            {/* Number circle */}
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-display font-semibold transition-all duration-300 shrink-0 ${
                i === active
                  ? "bg-white text-black scale-110"
                  : "bg-white/[0.06] text-white/40 group-hover:bg-white/10"
              }`}
            >
              {step.number}
            </div>

            {/* Connector line (desktop only) */}
            {i < steps.length - 1 && (
              <div className="hidden md:block absolute left-5 top-10 w-px h-8" />
            )}

            {/* Title */}
            <span
              className={`text-sm whitespace-nowrap transition-colors duration-300 ${
                i === active ? "text-white font-medium" : "text-white/35 group-hover:text-white/50"
              }`}
            >
              {step.title}
            </span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      <div className="min-h-[280px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-white/60">
                  {steps[active].icon}
                </span>
              </div>
              <div>
                <h4 className="font-display font-semibold text-white text-base">
                  {steps[active].title}
                </h4>
              </div>
            </div>
            <p className="text-sm text-white/45 font-light leading-relaxed mb-5 max-w-md">
              {steps[active].description}
            </p>

            {/* CSS Mockup */}
            <StepMockup step={steps[active].number} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
