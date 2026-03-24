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
  const heroRef = useMouseParallax<HTMLDivElement>(40);

  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 grain overflow-hidden">
      {/* Video background — client-only via dynamic import */}
      <HeroVideo />
      <div className="absolute inset-0 z-[1] bg-black/30" />

      {/* Floating glass shapes with scroll parallax */}
      <GlassShape
        shape="sphere"
        className="w-64 h-64 -top-32 -left-32 z-0 opacity-60"
        speed={0.2}
      />
      <GlassShape
        shape="torus"
        className="w-96 h-96 top-1/2 -right-48 z-0 opacity-40"
        speed={-0.1}
      />
      <GlassShape
        shape="sphere"
        className="w-48 h-48 bottom-20 left-1/4 z-0 opacity-50"
        speed={0.15}
      />

      {/* Mouse-parallax hero content */}
      <div ref={heroRef} className="relative z-10 will-change-transform">
        <AnimatedSection>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card glass-glint mb-10">
            <span className="material-symbols-outlined text-[16px] text-white/60">
              auto_awesome
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">
              AI-Хөтлөгдсөн Ухаалаг Борлуулалт
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif italic text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] text-white leading-[0.95] max-w-5xl mb-8">
            <span className="shimmer-text">Таны брэндэд</span>
            <br />
            <span className="text-white/40">хэрэгтэй AI</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-white/40 font-light max-w-xl mx-auto leading-relaxed mb-12">
            Vela AI нь таны бүтээгдэхүүний каталогоос суралцсан AI борлуулагчийг ажиллуулж, 24/7
            худалдан авагчдад хариулна.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Үнэгүй эхлэх
            </Link>
            <Link
              href="#how-it-works"
              className="glass-card glass-glint text-sm text-white/70 font-medium px-8 py-3.5 rounded-full hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Яаж ажилладаг
            </Link>
          </div>
        </AnimatedSection>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10" />
    </section>
  );
}
