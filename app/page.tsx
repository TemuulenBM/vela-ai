import Link from "next/link";
import Image from "next/image";
import { AnimatedSection } from "./animated-section";
import { StatsCounter } from "./stats-counter";
import { ChatDemo } from "./chat-demo";
import { HeroSection } from "./hero-section";
import { HowItWorksDemo } from "./how-it-works-demo";
import { TiltCard } from "./tilt-card";
import { GlassShape } from "@/shared/components/ui/glass-shape";
import { VelaLogo } from "./vela-logo";

const logoStrip = ["Shoppy", "eMarket", "Gobi", "Nomin", "Mmarket"];

const capabilities = [
  {
    title: "AI Борлуулалт",
    description:
      "Template-тэй тэмцэхээ боль. Таны каталогоос суралцсан AI борлуулагч бараа бүрийн мэдээллийг эзэмшсэн байна. Таны дэлгүүрийн давтагдашгүй шинж чанарт тохирсон хариулт.",
    image: "/images/ai-sales.jpg",
    imageFirst: true,
  },
  {
    title: "Аналитик Оюун",
    description:
      "Бид дээд зэргийн тоон шинжилгээг ашиглан борлуулалтын бүх өгөгдлийг автоматаар боловсруулна. Дэлгүүр бүр мэргэжлийн креатив захирлын бүтээсэн мэт мэдээлэл авна.",
    image: "/images/analytics.jpg",
    imageFirst: false,
  },
];

const featureGrid = [
  {
    icon: "bolt",
    title: "Хурдан хариу",
    description: "Дундаж 2.4 секундэд бараа хайж, нарийвчилсан мэдээллээр хариулна.",
  },
  {
    icon: "palette",
    title: "Авто-тохиргоо",
    description: "Ухаалаг дэлгүүр таних систем таны каталогийг хэдхэн минутад бүрэн сурна.",
  },
  {
    icon: "trending_up",
    title: "Борлуулалт нэмнэ",
    description:
      "Cross-sell зөвлөмж, захиалга хүлээн авалт — борлуулалтын бүх алхмыг автоматжуулна.",
  },
  {
    icon: "shield",
    title: "Аюулгүй байдал",
    description:
      "Мэдээллийн хамгаалалт, тусгаарлалт, нууцлалын бодлого — таны бизнест бүрэн найдвартай.",
  },
];

const stats = [
  { value: 200, suffix: "+", label: "Холбогдсон дэлгүүр", formatType: "integer" as const },
  { value: 98, suffix: "%", label: "Хэрэглэгчийн сэтгэл ханамж", formatType: "integer" as const },
  { value: 3.2, suffix: "x", label: "Борлуулалтын өсөлт", formatType: "seconds" as const },
  { value: 5, suffix: " хоног", label: "Дундаж холболт", formatType: "integer" as const },
];

const testimonials = [
  {
    quote:
      "Vela AI зүгээр вэбсайт бүтээгээгүй, бидэнд дижитал сэтгэгдэл үлдээсэн. Чанар нь давтагдашгүй.",
    name: "Батбаяр Д.",
    company: "Gobi Cashmere",
    color: "bg-emerald-500/20",
  },
  {
    quote: "Хамгийн хурдан шийдэл. Нэг ч алдаа гаргалгүй бүх зүйлийг нэгтгэсэн. Цэвэр шидэт ажил.",
    name: "Оюунцэцэг Б.",
    company: "Nomin Holdings",
    color: "bg-blue-500/20",
  },
  {
    quote: "Liquid glass дизайн бол яг бидэнд хэрэгтэй байсан зүйл. Ердийн SaaS-аас тод ялгарна.",
    name: "Энхбат Т.",
    company: "eMarket Mongolia",
    color: "bg-purple-500/20",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh bg-black">
      {/* ═══ Fixed Navbar ═══ */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-card rounded-full px-4 py-2.5 sm:px-6 sm:py-3 flex items-center justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
          <VelaLogo size={18} />
          <div className="hidden md:flex items-center gap-8">
            {["Нүүр", "Үйлчилгээ", "Ажлууд", "Процесс", "Үнэ"].map((label) => (
              <Link
                key={label}
                href="#"
                className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>
          <Link
            href="/register"
            className="bg-white text-black text-[13px] font-medium px-5 py-2 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Эхлэх
          </Link>
        </div>
      </nav>

      {/* ═══ Hero Section — client component with mouse parallax ═══ */}
      <HeroSection />

      {/* ═══ Logo Strip — grayscale hover ═══ */}
      <AnimatedSection>
        <section className="py-16 sm:py-20 px-4 sm:px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-10">
              Салбарын тэргүүлэгчдийн итгэл
            </p>
            <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap opacity-50 grayscale hover:grayscale-0 hover:opacity-80 transition-all duration-700">
              {logoStrip.map((name) => (
                <span
                  key={name}
                  className="font-serif italic text-xl sm:text-2xl text-white/40 hover:text-white/70 transition-colors duration-500"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ How It Works ═══ */}
      <AnimatedSection>
        <section id="how-it-works" className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
          <GlassShape
            shape="sphere"
            className="w-80 h-80 -top-20 right-1/4 z-0 opacity-30"
            speed={0.1}
          />

          <div className="mx-auto max-w-5xl relative z-10">
            <div className="text-center mb-16">
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">
                Хэрхэн ажилладаг
              </p>
              <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] text-white leading-[1.05] mb-6">
                Та төсөөлнө.
                <br />
                Бид бүтээнэ.
              </h2>
              <p className="text-sm sm:text-base text-white/45 font-light max-w-lg mx-auto leading-relaxed">
                Манай AI систем таны барааны каталогийг бүрэн функциональ, өндөр бүтээмжтэй
                борлуулалтын туслах болгон хувиргана — хэдхэн өдрийн дотор.
              </p>
            </div>

            <HowItWorksDemo />
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Capabilities ═══ */}
      <AnimatedSection>
        <section id="capabilities" className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Боломжууд</p>
            <h2 className="font-serif italic text-4xl sm:text-5xl tracking-[-0.03em] text-white leading-[1.05] mb-16 sm:mb-20 max-w-2xl">
              Мэргэжлийн функц.
              <br />
              Тэг төвөгтэй байдал.
            </h2>

            <div className="space-y-20 sm:space-y-28">
              {capabilities.map((cap, i) => (
                <AnimatedSection key={cap.title} delay={i * 0.1}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center">
                    <div className={cap.imageFirst ? "md:order-2" : "md:order-1"}>
                      <h3 className="font-headline italic text-3xl sm:text-4xl tracking-[-0.02em] text-white mb-5">
                        {cap.title}
                      </h3>
                      <p className="text-[15px] text-white/40 font-light leading-relaxed max-w-md">
                        {cap.description}
                      </p>
                    </div>
                    <div className={cap.imageFirst ? "md:order-1" : "md:order-2"}>
                      <div className="rounded-2xl aspect-video overflow-hidden group">
                        <Image
                          src={cap.image}
                          alt={cap.title}
                          width={1024}
                          height={576}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Feature Grid — 3D Tilt Cards ═══ */}
      <AnimatedSection>
        <section className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden">
          <GlassShape
            shape="torus"
            className="w-72 h-72 -bottom-20 -left-20 z-0 opacity-30"
            speed={-0.15}
          />

          <div className="mx-auto max-w-6xl relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {featureGrid.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={i * 0.08}>
                  <TiltCard className="rounded-2xl border border-white/[0.06] p-5 sm:p-7 h-full">
                    <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.08]">
                      <span className="material-symbols-outlined text-[20px] text-white/50">
                        {feature.icon}
                      </span>
                    </div>
                    <h3 className="font-headline italic text-xl text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[14px] text-white/40 font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </TiltCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Stats Strip ═══ */}
      <AnimatedSection>
        <section id="stats" className="relative py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
          <GlassShape
            shape="sphere"
            className="w-48 h-48 bottom-10 right-1/4 z-0 opacity-40"
            speed={0.15}
          />

          <div className="mx-auto max-w-5xl relative z-10">
            <div className="rounded-2xl border border-white/[0.06] px-5 py-8 sm:px-8 sm:py-12 md:px-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-12 text-center">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <StatsCounter
                        to={stat.value}
                        formatType={stat.formatType}
                        className="font-headline italic text-3xl sm:text-4xl md:text-5xl text-white"
                      />
                      <span className="font-headline italic text-3xl sm:text-4xl md:text-5xl text-white">
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/40">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Testimonials — 3D Tilt Cards ═══ */}
      <AnimatedSection>
        <section className="py-20 sm:py-28 px-4 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 0.1}>
                  <TiltCard className="rounded-2xl border border-white/[0.06] p-7 h-full flex flex-col justify-between">
                    <p className="font-serif italic text-lg text-white/80 leading-relaxed mb-8">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full ${t.color} flex items-center justify-center`}
                      >
                        <span className="text-xs font-medium text-white/80">
                          {t.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{t.name}</p>
                        <p className="text-xs text-white/45">{t.company}</p>
                      </div>
                    </div>
                  </TiltCard>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ CTA Section ═══ */}
      <AnimatedSection>
        <section className="relative py-20 sm:py-32 px-4 sm:px-6 text-center overflow-hidden">
          <GlassShape
            shape="sphere"
            className="w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 opacity-20"
            speed={0.05}
          />

          <div className="mx-auto max-w-3xl relative z-10">
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] text-white leading-[1.05] mb-10">
              <span className="shimmer-text">Таны дараагийн</span>
              <br />
              <span className="text-white/40">борлуулалт эндээс.</span>
            </h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Одоо эхлэх
              </Link>
              <Link
                href="#"
                className="glass-card glass-glint text-sm text-white/70 font-medium px-8 py-3.5 rounded-full hover:text-white hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Демо авах
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Footer ═══ */}
      <footer className="relative py-12 sm:py-16 px-4 sm:px-6 overflow-hidden border-t border-white/[0.06]">
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent" />
        <div className="mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Column 1: Logo + description + social */}
            <div className="sm:col-span-2 lg:col-span-1">
              <VelaLogo size={18} />
              <p className="text-sm text-white/40 font-light mt-4 mb-6 leading-relaxed">
                Монголын e-commerce-д зориулсан AI борлуулалтын ухаалаг шийдэл.
              </p>
              <div className="flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="#"
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                {/* Instagram */}
                <a
                  href="#"
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="Instagram"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                {/* LinkedIn */}
                <a
                  href="#"
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="LinkedIn"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                {/* X (Twitter) */}
                <a
                  href="#"
                  className="text-white/30 hover:text-white/60 transition-colors"
                  aria-label="X"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Бүтээгдэхүүн */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium mb-4">
                Бүтээгдэхүүн
              </h4>
              <ul className="space-y-2.5">
                {["AI Борлуулагч", "Аналитик", "Каталог удирдлага", "Chat Widget", "API"].map(
                  (link) => (
                    <li key={link}>
                      <Link
                        href="#"
                        className="text-sm text-white/35 hover:text-white/60 transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Column 3: Компани */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium mb-4">
                Компани
              </h4>
              <ul className="space-y-2.5">
                {["Бидний тухай", "Блог", "Ажлын байр", "Түншлэл"].map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-white/35 hover:text-white/60 transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Холбоо барих */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.15em] text-white/60 font-medium mb-4">
                Холбоо барих
              </h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-white/35">mail</span>
                  <span className="text-sm text-white/35">hello@vela.mn</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-white/35">phone</span>
                  <span className="text-sm text-white/35">+976 7700 0000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-white/35 mt-0.5">
                    location_on
                  </span>
                  <span className="text-sm text-white/35">Улаанбаатар, Монгол</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/20">
              &copy; {new Date().getFullYear()} Vela AI. Бүх эрх хуулиар хамгаалагдсан.
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                Нууцлалын бодлого
              </Link>
              <Link
                href="/terms"
                className="text-xs text-white/20 hover:text-white/40 transition-colors"
              >
                Үйлчилгээний нөхцөл
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Chat Widget Demo */}
      <ChatDemo />
    </div>
  );
}
