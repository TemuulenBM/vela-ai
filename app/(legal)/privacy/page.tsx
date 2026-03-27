import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Нууцлалын бодлого | Vela AI",
  description:
    "Vela AI таны хувийн мэдээлэл болон Facebook/Instagram платформын өгөгдлийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаар.",
};

export default function PrivacyPolicyPage() {
  return (
    <article>
      {/* Header */}
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">
          Сүүлд шинэчилсэн: 2026 оны 3-р сарын 27
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] italic text-4xl sm:text-5xl tracking-[-0.03em] text-white">
          Нууцлалын бодлого
        </h1>
      </header>

      <div className="space-y-10 text-[15px] text-white/60 font-light leading-relaxed">
        {/* Танилцуулга */}
        <section>
          <p>
            Vela AI (&ldquo;бид&rdquo;, &ldquo;манай&rdquo;, &ldquo;бидний&rdquo;) нь Vela AI
            платформыг ажиллуулдаг — цахим худалдааны бизнесүүдэд зориулсан AI борлуулалтын туслах.
            Энэхүү Нууцлалын бодлого нь бидний үйлчилгээг ашиглах үед, тэр дундаа Meta (Facebook
            болон Instagram) платформоор дамжуулан хүлээн авсан өгөгдлийг хэрхэн цуглуулж, ашиглаж,
            хадгалж, хамгаалдаг талаар тайлбарладаг.
          </p>
          <p className="mt-4">
            Vela AI-г ашигласнаар та энэхүү бодлогод заасан практикийг зөвшөөрч байгаа болно. Хэрэв
            та зөвшөөрөхгүй бол үйлчилгээг ашиглахаа зогсооно уу.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 1. Цуглуулдаг мэдээлэл */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            1. Цуглуулдаг мэдээлэл
          </h2>

          <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 mt-6">
            Бүртгэлийн мэдээлэл
          </h3>
          <p>
            Та бүртгэл үүсгэхдээ нэр, имэйл хаяг, бизнесийн нэр болон бусад бүртгэлийн мэдээллийг
            бидэнд өгдөг.
          </p>

          <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 mt-6">
            Facebook &amp; Instagram платформын өгөгдөл
          </h3>
          <p>
            Та Facebook хуудас эсвэл Instagram мэргэжлийн бүртгэлээ холбох үед бид дараах мэдээллийг
            хүлээн авч хадгалдаг:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Хуудасны ID, хуудасны нэр, Instagram хэрэглэгчийн нэр</li>
            <li>Хуудасны хандалтын токен (AES-256-GCM-ээр шифрлэгдсэн)</li>
            <li>
              Facebook Messenger болон Instagram Direct-ээр хүлээн авсан зурвасууд — илгээгчийн нэр,
              профайл зургийн URL, зурвасын текст, цагийн тэмдэг зэрэг
            </li>
          </ul>

          <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 mt-6">
            Бүтээгдэхүүний каталогийн өгөгдөл
          </h3>
          <p>
            Та өөрийн цахим дэлгүүрээс байршуулсан эсвэл синк хийсэн бүтээгдэхүүний мэдээлэл (нэр,
            тайлбар, үнэ, зураг).
          </p>

          <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 mt-6">
            Хэрэглээ &amp; аналитик өгөгдөл
          </h3>
          <p>
            Харилцааны тоо, хариултын хэмжигдэхүүн болон таны хяналтын самбар дээрх бизнесийн
            мэдээллийг гаргахад ашигладаг нэгтгэсэн үйл явдлын өгөгдөл.
          </p>

          <h3 className="text-sm uppercase tracking-[0.1em] text-white/50 mb-2 mt-6">
            Техникийн өгөгдөл
          </h3>
          <p>
            Webhook хүсэлтүүдийн IP хаяг, хөтчийн төрөл, төхөөрөмжийн мэдээлэл болон үйлчилгээ
            ашиглах явцад автоматаар цуглуулагдсан цагийн тэмдэг.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 2. Мэдээллийг хэрхэн ашигладаг */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            2. Мэдээллийг хэрхэн ашигладаг
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white/80">AI туслах үйлчилгээ үзүүлэх</strong> — ирсэн
              зурвасуудыг боловсруулж, таны хэрэглэгчдэд AI-ээр хариулт үүсгэх
            </li>
            <li>
              <strong className="text-white/80">Аналитик хүргэх</strong> — хяналтын самбар дээр
              харилцааны мэдээлэл, бизнесийн хэмжигдэхүүн гаргах
            </li>
            <li>
              <strong className="text-white/80">Үйлчилгээг сайжруулах</strong> — гүйцэтгэлийг хянах,
              алдааг засах, шинэ боломжуудыг хөгжүүлэх
            </li>
            <li>
              <strong className="text-white/80">Тантай харилцах</strong> — үйлчилгээтэй холбоотой
              мэдэгдэл илгээх, тусламжийн хүсэлтэд хариулах
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 3. Facebook болон Instagram өгөгдөл */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            3. Facebook болон Instagram өгөгдөл
          </h2>
          <p>
            Бид Facebook болон Instagram платформын өгөгдлийг маш нухацтай авч үздэг. Meta-гийн
            API-аар дамжуулан хүлээн авсан өгөгдөлд дараах зүйлс хамаарна:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              Платформын өгөгдлийг <strong className="text-white/80">зөвхөн</strong> та зөвшөөрсөн
              зурвас илгээх болон AI туслах үйлчилгээг үзүүлэхэд ашигладаг.
            </li>
            <li>
              Бид Facebook эсвэл Instagram-ын өгөгдлийг гуравдагч этгээдэд сурталчилгаа, маркетинг,
              эсвэл өгөгдөл зуучлалын зорилгоор{" "}
              <strong className="text-white/80">зардаггүй, түрээслүүлдэггүй, лицензлэдэггүй</strong>
              .
            </li>
            <li>
              Зурвасын агуулгыг зөвхөн AI хариулт үүсгэх зорилгоор Anthropic-ийн Claude API руу
              илгээдэг. Anthropic энэ өгөгдлийг өөрийн{" "}
              <a
                href="https://www.anthropic.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
              >
                Нууцлалын бодлого
              </a>
              -ын дагуу боловсруулдаг бөгөөд загвар сургалтад ашигладаггүй.
            </li>
            <li>
              Хандалтын токенуудыг AES-256-GCM-ээр шифрлэдэг бөгөөд client-side кодод хэзээ ч
              харагддаггүй.
            </li>
            <li>
              Бид Meta-гийн Платформын нөхцөл болон Хөгжүүлэгчийн бодлогыг бүх үед дагаж мөрддөг.
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 4. Өгөгдөл хуваалцах */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            4. Өгөгдөл хуваалцах ба гуравдагч этгээд
          </h2>
          <p>
            Бид зөвхөн платформыг ажиллуулах зорилгоор дараах үйлчилгээ үзүүлэгчидтэй өгөгдөл
            хуваалцдаг:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>
              <strong className="text-white/80">Anthropic</strong> — AI хариулт үүсгэхийн тулд
              зурвасын агуулгыг Claude API руу илгээдэг
            </li>
            <li>
              <strong className="text-white/80">Meta Platforms</strong> — Messenger болон Instagram
              API-аар зурвас илгээж, хүлээн авдаг
            </li>
            <li>
              <strong className="text-white/80">Мэдээллийн сан</strong> — таны өгөгдлийг шифрлэгдсэн
              PostgreSQL мэдээллийн санд хадгалдаг
            </li>
            <li>
              <strong className="text-white/80">Vercel</strong> — апп хостинг болон edge сүлжээ
            </li>
          </ul>
          <p className="mt-4">
            Бид таны хувийн мэдээллийг зардаггүй. Хуулиар шаардлагатай эсвэл хууль ёсны эрхээ
            хамгаалах шаардлагатай тохиолдолд мэдээллийг задруулж болно.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 5. Өгөгдөл хадгалах */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            5. Өгөгдөл хадгалах хугацаа
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white/80">Бүртгэлийн өгөгдөл</strong> — бүртгэл идэвхтэй байх
              хугацаанд хадгалагдана. Устгах хүсэлт ирснээс хойш 30 хоногийн дотор устгагдана.
            </li>
            <li>
              <strong className="text-white/80">Харилцаа ба зурвасууд</strong> — 12 сар хүртэл
              хадгалагдаж, дараа нь автоматаар устгагдана.
            </li>
            <li>
              <strong className="text-white/80">Хандалтын токенууд</strong> — шифрлэгдсэн байдлаар
              хадгалагдаж, дахин холбогдох үед шинэчлэгдэж, суваг салгах үед шууд устгагдана.
            </li>
            <li>
              <strong className="text-white/80">Аналитик өгөгдөл</strong> — захиалгын хугацаанд
              нэгтгэсэн хэлбэрээр хадгалагдана.
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 6. Таны эрхүүд */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            6. Таны эрхүүд
          </h2>
          <p>Та дараах эрхтэй:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>
              <strong className="text-white/80">Хандах</strong> — бидний хадгалж буй хувийн
              мэдээллийн хуулбарыг авах
            </li>
            <li>
              <strong className="text-white/80">Засварлах</strong> — буруу мэдээллийг засуулахыг
              хүсэх
            </li>
            <li>
              <strong className="text-white/80">Устгах</strong> — өгөгдлөө устгуулахыг хүсэх (манай{" "}
              <a
                href="/data-deletion"
                className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
              >
                Өгөгдөл устгах
              </a>{" "}
              хуудсыг үзнэ үү)
            </li>
            <li>
              <strong className="text-white/80">Зөөвөрлөх</strong> — өгөгдлөө бүтэцтэй, машин
              уншигдах форматаар хүлээн авах
            </li>
            <li>
              <strong className="text-white/80">Зөвшөөрөл цуцлах</strong> — хяналтын самбарын
              тохиргооноос Facebook/Instagram бүртгэлээ хүссэн үедээ салгах
            </li>
          </ul>
          <p className="mt-4">
            Эдгээр эрхийг хэрэгжүүлэхийн тулд бидэнтэй холбогдоно уу:{" "}
            <a
              href="mailto:temuulen.developer@gmail.com"
              className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              temuulen.developer@gmail.com
            </a>
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 7. Өгөгдлийн аюулгүй байдал */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            7. Өгөгдлийн аюулгүй байдал
          </h2>
          <p>Бид таны өгөгдлийг хамгаалахын тулд дараах аюулгүй байдлын арга хэмжээг авдаг:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Хадгалагдсан бүх хандалтын токенд AES-256-GCM шифрлэлт</li>
            <li>Түрээслэгчийн өгөгдлийг хатуу тусгаарлах мөр түвшний аюулгүй байдал (RLS)</li>
            <li>Дамжуулагдаж буй бүх өгөгдөлд HTTPS/TLS шифрлэлт</li>
            <li>Ирж буй бүх Meta webhook-д SHA-256 HMAC гарын үсгийн баталгаажуулалт</li>
            <li>API түлхүүрүүдийг зөвхөн серверт хадгалдаг — client-д хэзээ ч харагддаггүй</li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 8. Хүүхдийн нууцлал */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            8. Хүүхдийн нууцлал
          </h2>
          <p>
            Vela AI нь 13-аас доош насны хүмүүст зориулагдаагүй. Бид хүүхдээс хувийн мэдээлэл
            зориудаар цуглуулдаггүй. Хэрэв хүүхэд бидэнд хувийн мэдээлэл өгсөн гэж үзвэл бидэнтэй
            холбогдоно уу, бид тэр даруй устгах болно.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 9. Бодлогын өөрчлөлт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            9. Энэхүү бодлогын өөрчлөлт
          </h2>
          <p>
            Бид энэхүү Нууцлалын бодлогыг үе үе шинэчилж болно. Материаллаг өөрчлөлтийн тухай энэ
            хуудсан дээр шинэчилсэн бодлогыг нийтэлж, &ldquo;Сүүлд шинэчилсэн&rdquo; огноог шинэчлэх
            замаар мэдэгдэнэ. Өөрчлөлтийн дараа үйлчилгээг үргэлжлүүлэн ашиглах нь зөвшөөрсөнд
            тооцогдоно.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 10. Холбоо барих */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            10. Холбоо барих
          </h2>
          <p>
            Энэхүү Нууцлалын бодлого эсвэл бидний өгөгдлийн практикийн талаар асуулт байвал бидэнтэй
            холбогдоно уу:
          </p>
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-5">
            <p className="text-white/80">Vela AI</p>
            <p className="mt-1">
              Имэйл:{" "}
              <a
                href="mailto:temuulen.developer@gmail.com"
                className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
              >
                temuulen.developer@gmail.com
              </a>
            </p>
            <p className="mt-1">Байршил: Улаанбаатар, Монгол</p>
          </div>
        </section>
      </div>
    </article>
  );
}
