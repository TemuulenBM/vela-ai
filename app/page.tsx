import Link from "next/link";
import { AnimatedSection } from "./animated-section";
import { StatsCounter } from "./stats-counter";
import { ChatDemo } from "./chat-demo";

const navLinks = [
  { label: "Нүүр", href: "#" },
  { label: "Үйлчилгээ", href: "#capabilities" },
  { label: "Ажлууд", href: "#stats" },
  { label: "Процесс", href: "#how-it-works" },
  { label: "Үнэ", href: "#pricing" },
];

const logoStrip = ["Shoppy", "eMarket", "Gobi", "Nomin", "Mmarket"];

const capabilities = [
  {
    title: "AI Борлуулалт",
    description:
      "Template-тэй тэмцэхээ боль. Таны каталогоос суралцсан AI борлуулагч бараа бүрийн мэдээллийг эзэмшсэн байна. Таны дэлгүүрийн давтагдашгүй шинж чанарт тохирсон хариулт.",
    hasImage: true,
    imageFirst: false,
  },
  {
    title: "Аналитик Оюун",
    description:
      "Бид дээд зэргийн тоон шинжилгээг ашиглан борлуулалтын бүх өгөгдлийг автоматаар боловсруулна. Дэлгүүр бүр мэргэжлийн креатив захирлын бүтээсэн мэт мэдээлэл авна.",
    hasImage: true,
    imageFirst: true,
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
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <div className="glass-card rounded-full px-6 py-3 flex items-center justify-between">
          <Link href="/" className="font-serif italic text-white text-lg">
            Vela AI
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-white/50 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/register"
            className="bg-white text-black text-[13px] font-medium px-5 py-2 rounded-full hover:bg-white/90 transition-colors duration-200"
          >
            Эхлэх
          </Link>
        </div>
      </nav>

      {/* ═══ Hero Section ═══ */}
      <section className="relative min-h-dvh flex flex-col items-center justify-center text-center px-6 pt-24 pb-32 grain">
        {/* Background orbs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[100px]" />
        </div>

        <AnimatedSection>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-10">
            <span className="material-symbols-outlined text-[16px] text-white/60">
              auto_awesome
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-medium">
              AI-Хөтлөгдсөн Ухаалаг Борлуулалт
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-serif italic text-5xl sm:text-7xl md:text-8xl lg:text-9xl tracking-[-0.03em] text-white leading-[0.95] max-w-5xl mb-8">
            Таны брэндэд
            <br />
            хэрэгтэй AI
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
              className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-200"
            >
              Үнэгүй эхлэх
            </Link>
            <Link
              href="#how-it-works"
              className="glass-card text-sm text-white/70 font-medium px-8 py-3.5 rounded-full hover:text-white transition-colors duration-200 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">play_arrow</span>
              Яаж ажилладаг
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* ═══ Logo Strip ═══ */}
      <AnimatedSection>
        <section className="py-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-10">
              Салбарын тэргүүлэгчдийн итгэл
            </p>
            <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
              {logoStrip.map((name) => (
                <span key={name} className="font-serif italic text-xl sm:text-2xl text-white/25">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ How It Works ═══ */}
      <AnimatedSection>
        <section id="how-it-works" className="py-28 px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-6">
              Хэрхэн ажилладаг
            </p>
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] text-white leading-[1.05] mb-6">
              Та төсөөлнө.
              <br />
              Бид бүтээнэ.
            </h2>
            <p className="text-base text-white/40 font-light max-w-lg mx-auto leading-relaxed mb-10">
              Манай AI систем таны барааны каталогийг бүрэн функциональ, өндөр бүтээмжтэй
              борлуулалтын туслах болгон хувиргана — хэдхэн өдрийн дотор.
            </p>
            <Link
              href="#capabilities"
              className="inline-flex items-center gap-2 glass-card text-sm text-white/70 font-medium px-7 py-3 rounded-full hover:text-white transition-colors duration-200"
            >
              Процессыг мэдэх
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Capabilities ═══ */}
      <AnimatedSection>
        <section id="capabilities" className="py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-4">Боломжууд</p>
            <h2 className="font-serif italic text-4xl sm:text-5xl tracking-[-0.03em] text-white leading-[1.05] mb-20 max-w-2xl">
              Мэргэжлийн функц.
              <br />
              Тэг төвөгтэй байдал.
            </h2>

            <div className="space-y-20">
              {capabilities.map((cap, i) => (
                <AnimatedSection key={cap.title} delay={i * 0.1}>
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${
                      cap.imageFirst ? "md:[direction:rtl]" : ""
                    }`}
                  >
                    <div className={cap.imageFirst ? "md:[direction:ltr]" : ""}>
                      <h3 className="font-serif italic text-2xl sm:text-3xl text-white mb-4">
                        {cap.title}
                      </h3>
                      <p className="text-sm text-white/40 font-light leading-relaxed max-w-md">
                        {cap.description}
                      </p>
                    </div>
                    <div className={cap.imageFirst ? "md:[direction:ltr]" : ""}>
                      <div className="glass-card rounded-3xl aspect-[4/3] flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-white/[0.04] to-transparent flex items-center justify-center">
                          <span className="material-symbols-outlined text-[48px] text-white/10">
                            {i === 0 ? "smart_toy" : "analytics"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Feature Grid ═══ */}
      <AnimatedSection>
        <section className="py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {featureGrid.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={i * 0.08}>
                  <div className="glass-card rounded-3xl p-7 h-full">
                    <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.05]">
                      <span className="material-symbols-outlined text-[22px] text-white/60">
                        {feature.icon}
                      </span>
                    </div>
                    <h3 className="font-serif italic text-lg text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/35 font-light leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Stats Strip ═══ */}
      <AnimatedSection>
        <section id="stats" className="py-20 px-6">
          <div className="mx-auto max-w-5xl">
            <div className="glass-card rounded-3xl px-8 py-12 sm:px-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-baseline justify-center gap-0.5">
                      <StatsCounter
                        to={stat.value}
                        formatType={stat.formatType}
                        className="font-serif italic text-4xl sm:text-5xl text-white"
                      />
                      <span className="font-serif italic text-4xl sm:text-5xl text-white">
                        {stat.suffix}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.15em] text-white/35">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Testimonials ═══ */}
      <AnimatedSection>
        <section className="py-28 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <AnimatedSection key={t.name} delay={i * 0.1}>
                  <div className="glass-card rounded-3xl p-7 h-full flex flex-col justify-between">
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
                        <p className="text-xs text-white/35">{t.company}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ CTA Section ═══ */}
      <AnimatedSection>
        <section className="py-32 px-6 text-center">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl tracking-[-0.03em] text-white leading-[1.05] mb-10">
              Таны дараагийн
              <br />
              борлуулалт эндээс.
            </h2>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/register"
                className="bg-white text-black text-sm font-medium px-8 py-3.5 rounded-full hover:bg-white/90 transition-colors duration-200"
              >
                Одоо эхлэх
              </Link>
              <Link
                href="#"
                className="glass-card text-sm text-white/70 font-medium px-8 py-3.5 rounded-full hover:text-white transition-colors duration-200"
              >
                Демо авах
              </Link>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* ═══ Footer ═══ */}
      <footer className="py-12 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <Link href="/" className="font-serif italic text-white/70 text-xl inline-block mb-8">
            Vela AI
          </Link>
          <div className="flex items-center justify-center gap-8 mb-8 flex-wrap">
            <Link
              href="#"
              className="text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/50 transition-colors"
            >
              Нууцлалын бодлого
            </Link>
            <Link
              href="#"
              className="text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/50 transition-colors"
            >
              Үйлчилгээний нөхцөл
            </Link>
            <Link
              href="#"
              className="text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/50 transition-colors"
            >
              Холбоо барих
            </Link>
            <Link
              href="#"
              className="text-[10px] uppercase tracking-[0.15em] text-white/30 hover:text-white/50 transition-colors"
            >
              LinkedIn
            </Link>
          </div>
          <p className="text-xs text-white/20">
            &copy; {new Date().getFullYear()} Vela AI. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </footer>

      {/* Chat Widget Demo */}
      <ChatDemo />
    </div>
  );
}
