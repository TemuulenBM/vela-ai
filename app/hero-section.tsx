"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { AnimatedSection } from "./animated-section";
import { GlassShape } from "@/shared/components/ui/glass-shape";
import { useMouseParallax } from "@/shared/hooks/use-mouse-parallax";

const HeroVideo = dynamic(() => import("./hero-video").then((m) => ({ default: m.HeroVideo })), {
  ssr: false,
});

export function HeroSection() {
  const heroRef = useMouseParallax<HTMLDivElement>(60);

  return (
    <section className="relative min-h-dvh flex items-center px-6 sm:px-10 lg:px-16 grain overflow-hidden">
      {/* Video background — ambient texture */}
      <HeroVideo />

      {/* Vignette overlay */}
      <div className="absolute inset-0 z-[1] hero-vignette" />

      {/* Content grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 w-full py-28 sm:py-32">
        {/* Left — Text content, left-aligned */}
        <div ref={heroRef} className="will-change-transform">
          <AnimatedSection>
            {/* Eyebrow */}
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/30 font-body mb-8">
              Онлайн бизнесүүдэд зориулсан
            </p>

            {/* Heading — Cormorant serif italic */}
            <h1 className="font-headline italic text-[2.25rem] sm:text-5xl lg:text-[3.25rem] xl:text-[3.75rem] tracking-[-0.02em] text-white leading-[1.12] mb-7">
              Чатбот биш.
              <br />
              <span className="text-white/30">Борлуулагч.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] sm:text-base text-white/40 font-light max-w-md leading-relaxed mb-10">
              Таны бараа бүрийн үнэ, размер, өнгийг мэддэг AI. Худалдан авагч асуухад шууд хариулна
              — шөнийн 3 цагт ч гэсэн.
            </p>

            {/* CTA */}
            <div className="flex items-center gap-5">
              <Link
                href="/register"
                className="bg-white text-black text-sm font-medium px-7 py-3 rounded-xl hover:bg-white/90 active:scale-[0.97] transition-all duration-200"
              >
                Үнэгүй эхлэх
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm text-white/45 hover:text-white/70 transition-colors duration-200 flex items-center gap-1.5 group"
              >
                Яаж ажилладаг
                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform duration-200">
                  arrow_forward
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>

        {/* Right — Ambient visual */}
        <div className="hidden lg:flex items-center justify-center relative">
          <GlassShape
            shape="sphere"
            className="w-72 h-72 xl:w-80 xl:h-80 opacity-[0.15]"
            speed={0.06}
          />
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
}
