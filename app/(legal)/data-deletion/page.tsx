import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Өгөгдөл устгах | Vela AI",
  description: "Vela AI-аас өгөгдлөө устгуулах хүсэлт илгээх заавар.",
};

export default function DataDeletionPage() {
  return (
    <article>
      {/* Header */}
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">
          Сүүлд шинэчилсэн: 2026 оны 3-р сарын 27
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] italic text-4xl sm:text-5xl tracking-[-0.03em] text-white">
          Өгөгдөл устгах
        </h1>
      </header>

      <div className="space-y-10 text-[15px] text-white/60 font-light leading-relaxed">
        {/* Танилцуулга */}
        <section>
          <p>
            Та хүссэн үедээ Vela AI-аас хувийн мэдээллээ устгуулах хүсэлт гаргах боломжтой. Энэ
            хуудас нь хүсэлт гаргах арга болон ямар өгөгдөл устгагдахыг тайлбарладаг.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* Хүсэлт гаргах */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            Өгөгдөл устгах хүсэлт гаргах
          </h2>
          <p>
            Доорх хаяг руу &ldquo;Өгөгдөл устгах хүсэлт&rdquo; гэсэн гарчигтай имэйл илгээнэ үү:
          </p>
          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-5">
            <p className="text-white/80">
              <a
                href="mailto:temuulen.developer@gmail.com?subject=Data%20Deletion%20Request"
                className="underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
              >
                temuulen.developer@gmail.com
              </a>
            </p>
          </div>
          <p className="mt-4">
            Бид таны хэн болохыг баталгаажуулж, өгөгдлийг олохын тулд Vela AI бүртгэлтэй холбоотой
            имэйл хаягаа оруулна уу.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* Юу устгагдах */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            Ямар өгөгдөл устгагдах вэ
          </h2>
          <p>Баталгаажсан устгах хүсэлтийн дагуу бид дараахийг устгана:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Таны бүртгэлийн мэдээлэл (нэр, имэйл, бизнесийн мэдээлэл)</li>
            <li>Холбогдсон Facebook хуудас болон Instagram бүртгэлийн өгөгдөл</li>
            <li>Хадгалагдсан хандалтын токенууд</li>
            <li>Бүх харилцаа ба зурвасууд</li>
            <li>Таны бүтээгдэхүүний каталогийн өгөгдөл</li>
            <li>Таны бүртгэлтэй холбоотой аналитик болон үйл явдлын өгөгдөл</li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* Хугацаа */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            Устгалтын хугацаа
          </h2>
          <p>
            Баталгаажсан хүсэлт хүлээн авснаас хойш{" "}
            <strong className="text-white/80">30 хоногийн</strong> дотор бүх холбогдох өгөгдлийг
            устгана. Устгалт дууссаны дараа баталгаажуулах имэйл илгээнэ.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* Автомат устгалт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            Салгах үеийн автомат устгалт
          </h2>
          <p>
            Та хяналтын самбарын тохиргооноос Facebook хуудас эсвэл Instagram бүртгэлээ Vela AI-аас
            салгахад:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Хандалтын токенууд нэн даруй устгагдана</li>
            <li>
              Холбогдох харилцаа ба зурвасууд 30 хоног хадгалагдаж, дараа нь автоматаар устгагдана
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* Холбоо барих */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            Асуулт байна уу?
          </h2>
          <p>
            Өгөгдөл устгах талаар асуулт байвал манай{" "}
            <a
              href="/privacy"
              className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              Нууцлалын бодлого
            </a>
            -г үзэх эсвэл бидэнтэй холбогдоно уу:{" "}
            <a
              href="mailto:temuulen.developer@gmail.com"
              className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              temuulen.developer@gmail.com
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
