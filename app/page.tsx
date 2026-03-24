import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { ChatDemo } from "./chat-demo";
import { AnimatedSection } from "./animated-section";
import { StatsCounter } from "./stats-counter";
import { TypingIndicator } from "./typing-indicator";
import { BarChart3, Store, Check, ArrowRight, Sparkles, Zap, Bot, User } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Таны каталог — AI-ийн мэдлэг",
    description:
      '"Энэ гутал 38 размертэй юу?" гэхэд таны бараанаас шууд хайж хариулна. Өөрөө зохиохгүй, зөвхөн таны мэдээлэл.',
  },
  {
    icon: BarChart3,
    title: "Юу асуудаг, юу авдаг",
    description:
      "Хамгийн их асуугддаг бараа, хариулт аваагүй асуулт, орхигдсон захиалга — бүгд тоогоор харагдана.",
  },
  {
    icon: Store,
    title: "Бүх дэлгүүр нэг газар",
    description: "Shoppy, eMarket, өөрийн сайт — хамаагүй. Бүгдийг нэг дашбоардаас хянана.",
  },
];

const stats = [
  {
    value: 1247,
    label: "яриа өнгөрсөн сард",
    context: "Beta хэрэглэгчид",
    formatType: "locale" as const,
  },
  {
    value: 53,
    label: "дэлгүүр холбогдсон",
    context: "Монгол даяар",
    formatType: "integer" as const,
  },
  {
    value: 99.9,
    label: "тасалдалгүй ажиллагаа",
    context: "Сүүлийн 90 хоног",
    formatType: "percent" as const,
  },
  {
    value: 2.4,
    label: "дундаж хариу хугацаа",
    context: "Секундэд",
    formatType: "seconds" as const,
  },
];

const plans = [
  {
    name: "Үнэгүй",
    price: "₮0",
    period: "сар",
    description: "14 хоног туршаад шийдээрэй",
    popular: false,
    features: ["100 яриа/сар", "50 бараа", "1 дэлгүүр", "Үндсэн аналитик", "Имэйл тусламж"],
  },
  {
    name: "Стартер",
    price: "₮49,900",
    period: "сар",
    description: "Ихэнх дэлгүүрт энэ хангалттай",
    popular: true,
    features: [
      "1,000 яриа/сар",
      "500 бараа",
      "3 дэлгүүр",
      "Дэлгэрэнгүй аналитик",
      "Тэргүүлэх тусламж",
      "Cross-sell зөвлөмж",
    ],
  },
  {
    name: "Өсөлт",
    price: "₮149,900",
    period: "сар",
    description: "Хязгааргүй, бүх зүйл нээлттэй",
    popular: false,
    features: [
      "Хязгааргүй яриа",
      "Хязгааргүй бараа",
      "Хязгааргүй дэлгүүр",
      "Бүрэн аналитик",
      "24/7 тусламж",
      "API хандалт",
      "Тусгай интеграц",
    ],
  },
];

const popularPlan = plans.find((p) => p.popular)!;
const otherPlans = plans.filter((p) => !p.popular);

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border-subtle bg-surface-primary/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-14">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-[var(--radius-sm)] bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-text-primary tracking-tight">Vela AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Нэвтрэх</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Үнэгүй эхлэх</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero — asymmetric: text left, chat preview right */}
      <section className="relative overflow-hidden grain">
        <div className="absolute inset-0 -z-10">
          {/* Brand-tinted dot grid */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--color-brand-700) 0.5px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Three-layer gradient glow system */}
          <div className="absolute -top-32 -left-32 w-[800px] h-[800px] rounded-full bg-brand-400/[0.08] blur-[120px]" />
          <div className="absolute -bottom-48 right-0 w-[600px] h-[600px] rounded-full bg-brand-300/[0.06] blur-[100px]" />
          <div className="absolute top-1/4 right-[10%] w-[400px] h-[400px] rounded-full bg-brand-500/[0.10] blur-[80px]" />
        </div>
        {/* Hero-to-features fade divider */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-surface-secondary z-[2]" />

        <div className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
            {/* Left: text content */}
            <div className="md:col-span-3">
              <AnimatedSection>
                <Badge variant="brand" size="lg" className="mb-6">
                  <Zap className="h-3 w-3 mr-1" />
                  Монголын анхны AI борлуулалтын платформ
                </Badge>

                <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] font-bold tracking-[-0.03em] text-text-primary leading-[1.08] mb-5">
                  Шөнийн 2 цагт <br className="hidden sm:block" />
                  бараа асуухад{" "}
                  <span className="relative inline-block">
                    хэн хариулах вэ?
                    <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-brand-400 to-brand-600" />
                  </span>
                </h1>

                <p className="max-w-lg text-base text-text-secondary leading-relaxed mb-8">
                  Таны бүтээгдэхүүний мэдээлэлд суурилсан AI 24/7 худалдан авагчдад хариулж,
                  захиалга хүлээн авна. Борлуулагч нэмэхгүйгээр борлуулалт нэмнэ.
                </p>

                <div className="flex items-center gap-4">
                  <Button size="xl" asChild>
                    <Link href="/register">
                      Үнэгүй эхлэх
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Link
                    href="#features"
                    className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Яаж ажилладаг вэ?
                  </Link>
                </div>
              </AnimatedSection>
            </div>

            {/* Right: floating chat preview */}
            <AnimatedSection delay={0.15} className="md:col-span-2 relative">
              {/* Glow behind card */}
              <div className="absolute -inset-4 rounded-[var(--radius-xl)] bg-brand-400/[0.06] blur-2xl" />
              <div
                className="relative rounded-[var(--radius-xl)] border border-border-default bg-surface-primary overflow-hidden"
                style={{
                  boxShadow: `
                    0 0 0 1px rgba(13, 148, 136, 0.05),
                    0 4px 8px -2px rgba(24, 24, 27, 0.08),
                    0 16px 32px -8px rgba(24, 24, 27, 0.12),
                    0 32px 64px -16px rgba(24, 24, 27, 0.08)
                  `,
                }}
              >
                {/* Chat header */}
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-default bg-surface-secondary">
                  <div className="h-7 w-7 rounded-full bg-brand-600 flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Vela AI</p>
                    <p className="text-[10px] text-brand-600">Идэвхтэй</p>
                  </div>
                </div>
                {/* Chat messages */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-surface-tertiary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-text-tertiary" />
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-surface-tertiary px-3 py-2 text-xs text-text-primary max-w-[85%]">
                      Cashmere цамцны хэмжээ хэрхэн сонгох вэ?
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-brand-50 px-3 py-2 text-xs text-text-primary max-w-[85%]">
                      Gobi-н cashmere цамц хэвийн хэмжээтэй. Таны ердийн хэмжээгээр авч болно. M
                      хэмжээ: цээж 96-100см.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-surface-tertiary flex items-center justify-center shrink-0 mt-0.5">
                      <User className="h-3 w-3 text-text-tertiary" />
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-surface-tertiary px-3 py-2 text-xs text-text-primary max-w-[85%]">
                      Нөөцөд байна уу?
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-brand-50 px-3 py-2 text-xs text-text-primary max-w-[85%]">
                      Тийм, M хэмжээ 12ш нөөцөд байна. Захиалах уу?
                    </div>
                  </div>
                  {/* Typing indicator — gives the chat "life" */}
                  <div className="flex items-start gap-2">
                    <div className="h-6 w-6 rounded-full bg-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="h-3 w-3 text-white" />
                    </div>
                    <div className="rounded-[var(--radius-md)] bg-brand-50">
                      <TypingIndicator />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Features — asymmetric: large left + 2 stacked right */}
      <AnimatedSection>
        <section id="features" className="relative py-20 bg-surface-secondary">
          {/* Top edge gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />
          {/* Subtle dot grid for visual continuity */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, var(--color-brand-700) 0.5px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
                Яг юу хийдэг вэ?
              </h2>
              <p className="text-text-secondary max-w-md">
                Худалдан авагчтай ярилцаж, бараа зөвлөж, захиалга авна — та унтаж байхад ч.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(() => {
                const featured = features[0];
                const Icon = featured.icon;
                return (
                  <AnimatedSection delay={0.1} className="md:col-span-3">
                    <div className="h-full group relative rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-7 shadow-xs hover:shadow-md hover:border-brand-200 hover:-translate-y-px transition-all duration-200">
                      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">
                        {featured.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed max-w-sm">
                        {featured.description}
                      </p>
                    </div>
                  </AnimatedSection>
                );
              })()}

              <div className="md:col-span-2 flex flex-col gap-4">
                {features.slice(1).map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <AnimatedSection key={feature.title} delay={0.2 + i * 0.1}>
                      <div className="group relative flex-1 rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-6 shadow-xs hover:shadow-md hover:border-brand-200 hover:-translate-y-px transition-all duration-200">
                        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-1.5">
                          {feature.title}
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </AnimatedSection>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Stats — asymmetric: first stat hero-sized, rest normal */}
      <AnimatedSection>
        <section className="relative py-16 border-y border-border-subtle overflow-hidden">
          {/* Ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] rounded-full bg-brand-400/[0.05] blur-[80px]" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <StatsCounter
                    to={stat.value}
                    formatType={stat.formatType}
                    className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary"
                  />
                  <div className="mt-1.5 text-sm text-text-secondary">{stat.label}</div>
                  <div className="mt-1 text-xs text-text-tertiary">{stat.context}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing — featured plan full-width, others in 2-col */}
      <AnimatedSection>
        <section className="py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
                Үнэ
              </h2>
              <p className="text-text-secondary max-w-md">
                Нуугдмал төлбөр байхгүй. Хүссэн үедээ багцаа солих, цуцлах боломжтой.
              </p>
            </div>

            {/* Featured plan — full width, 2-col internal */}
            <div className="relative rounded-[var(--radius-xl)] border border-brand-500 bg-surface-primary p-8 shadow-md ring-1 ring-brand-500/20 mb-5">
              <Badge variant="brand" size="md" className="absolute -top-3 left-8">
                Түгээмэл
              </Badge>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-1">
                    {popularPlan.name}
                  </h3>
                  <p className="text-sm text-text-secondary mb-6">{popularPlan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-text-primary tracking-tight">
                      {popularPlan.price}
                    </span>
                    <span className="text-sm text-text-tertiary">/{popularPlan.period}</span>
                  </div>
                  <Button size="lg" className="w-full md:w-auto md:px-10" asChild>
                    <Link href="/register">Эхлэх</Link>
                  </Button>
                </div>
                <ul className="space-y-2.5 md:pt-2">
                  {popularPlan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm text-text-secondary"
                    >
                      <Check className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Other plans — 2-col */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {otherPlans.map((plan, i) => (
                <AnimatedSection key={plan.name} delay={0.1 + i * 0.1}>
                  <div className="rounded-[var(--radius-lg)] border border-border-default bg-surface-primary p-6 shadow-xs hover:shadow-sm transition-shadow duration-200">
                    <div className="mb-5">
                      <h3 className="text-lg font-semibold text-text-primary">{plan.name}</h3>
                      <p className="text-sm text-text-secondary mt-0.5">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <span className="text-3xl font-bold text-text-primary tracking-tight">
                        {plan.price}
                      </span>
                      <span className="text-sm text-text-tertiary">/{plan.period}</span>
                    </div>

                    <Button variant="secondary" size="lg" className="w-full mb-6" asChild>
                      <Link href="/register">Эхлэх</Link>
                    </Button>

                    <ul className="space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-sm text-text-secondary"
                        >
                          <Check className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* CTA — asymmetric: text left, button right */}
      <AnimatedSection>
        <section className="relative py-20 bg-brand-50 overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-300/[0.10] blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-brand-400/[0.08] blur-[80px]" />
          <div className="relative mx-auto max-w-6xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary mb-3">
                10 минутад холбогдоно
              </h2>
              <p className="text-text-secondary max-w-md">
                Бүртгүүлж, барааны каталогоо оруулаад л болоо. Код бичих шаардлагагүй.
              </p>
            </div>
            <Button size="xl" className="shrink-0" asChild>
              <Link href="/register">
                Үнэгүй эхлэх
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-[4px] bg-brand-600 flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-medium text-text-primary">Vela AI</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Нууцлалын бодлого
            </Link>
            <Link
              href="#"
              className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Үйлчилгээний нөхцөл
            </Link>
          </div>
          <p className="text-xs text-text-tertiary">
            &copy; {new Date().getFullYear()} Vela AI. Бүх эрх хуулиар хамгаалагдсан.
          </p>
        </div>
      </footer>

      {/* Chat Widget Demo */}
      <ChatDemo />
    </div>
  );
}
