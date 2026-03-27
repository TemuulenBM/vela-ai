import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Үйлчилгээний нөхцөл | Vela AI",
  description: "Vela AI платформыг ашиглах нөхцөл, дүрэм.",
};

export default function TermsOfServicePage() {
  return (
    <article>
      {/* Header */}
      <header className="mb-12">
        <p className="text-xs uppercase tracking-[0.15em] text-white/30 mb-4">
          Сүүлд шинэчилсэн: 2026 оны 3-р сарын 27
        </p>
        <h1 className="font-[family-name:var(--font-cormorant)] italic text-4xl sm:text-5xl tracking-[-0.03em] text-white">
          Үйлчилгээний нөхцөл
        </h1>
      </header>

      <div className="space-y-10 text-[15px] text-white/60 font-light leading-relaxed">
        {/* 1. Зөвшөөрөл */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            1. Нөхцлийг зөвшөөрөх
          </h2>
          <p>
            Vela AI (&ldquo;Үйлчилгээ&rdquo;)-г ашигласнаар та энэхүү Үйлчилгээний нөхцлийг дагаж
            мөрдөхийг зөвшөөрч байна. Хэрэв та бизнесийн нэрийн өмнөөс ашиглаж байгаа бол тухайн
            бизнесийг энэ нөхцлөөр үүрэг болгох эрхтэй гэдгээ илэрхийлж байна. Зөвшөөрөхгүй бол
            үйлчилгээг ашиглах боломжгүй.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 2. Үйлчилгээний тодорхойлолт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            2. Үйлчилгээний тодорхойлолт
          </h2>
          <p>
            Vela AI нь цахим худалдааны бизнесүүдэд зориулсан AI борлуулалтын туслах платформ юм.
            Үйлчилгээ нь дараах боломжуудыг олгоно:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Facebook хуудас болон Instagram мэргэжлийн бүртгэлээ холбох</li>
            <li>
              Messenger болон Instagram Direct-ээр хэрэглэгчийн зурвасуудад AI ашиглан автоматаар
              хариулах
            </li>
            <li>Бүтээгдэхүүний каталогоо байршуулж удирдах</li>
            <li>Харилцааны аналитик болон бизнесийн мэдээлэл харах</li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 3. Бүртгэл */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            3. Бүртгэл
          </h2>
          <p>Үйлчилгээг ашиглахын тулд та:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Үнэн зөв, бүрэн бүртгэлийн мэдээлэл өгөх</li>
            <li>Бүртгэлийнхээ нууц үгийн аюулгүй байдлыг хадгалах</li>
            <li>Бүртгэлд зөвшөөрөлгүй нэвтрэлт хийгдсэн тухай нэн даруй мэдэгдэх</li>
          </ul>
          <p className="mt-4">
            Таны бүртгэл дор хийгдсэн бүх үйл ажиллагаанд та хариуцлага хүлээнэ. Нэг бизнес нэг
            түрээслэгчийн бүртгэлтэй байх ёстой.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 4. Зөвшөөрөгдсөн хэрэглээ */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            4. Зөвшөөрөгдсөн хэрэглээ
          </h2>
          <p>
            Та үйлчилгээг зөвхөн хууль ёсны цахим худалдааны зорилгоор ашиглахыг зөвшөөрч байна:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Холбогдох бүх хууль тогтоомжийг дагаж мөрдөх</li>
            <li>
              Meta-гийн Платформын нөхцөл, Нийгэмлэгийн стандарт, Худалдааны бодлогыг дагаж мөрдөх
            </li>
            <li>Байршуулсан бүтээгдэхүүний мэдээлэл үнэн зөв, шинэчлэгдсэн байхыг хангах</li>
            <li>Хэрэглэгчийн асуултуудад шударгаар хариулах</li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 5. Хориглосон үйлдлүүд */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            5. Хориглосон үйлдлүүд
          </h2>
          <p>Та дараах зүйлийг хийж болохгүй:</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Хууль бус эсвэл хориглосон бараа, үйлчилгээ борлуулахад ашиглах</li>
            <li>Платформоор дамжуулан спам, дарамт, төөрөгдүүлэх зурвас илгээх</li>
            <li>Үйлчилгээг задлан шинжлэх, decompile хийх, disassemble хийх</li>
            <li>Хурдны хязгаарлалт, аюулгүй байдлын арга хэмжээ, хандалтын хяналтыг тойрох</li>
            <li>Гуравдагч этгээдийн эрхийг зөрчих байдлаар ашиглах</li>
            <li>
              Бидний бичгэн зөвшөөрөлгүйгээр үйлчилгээнд хандах эрхийг дахин зарах, дэд лицензлэх,
              түгээх
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 6. Оюуны өмч */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            6. Оюуны өмч
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong className="text-white/80">Vela AI</strong> нь програм хангамж, дизайн,
              брэндийг оролцуулан платформын бүх эрхийг эзэмшдэг.
            </li>
            <li>
              <strong className="text-white/80">Та</strong> өөрийн бүтээгдэхүүний каталогийн
              өгөгдөл, бизнесийн мэдээлэл, байршуулсан контентын өмчлөлийг хадгална.
            </li>
            <li>
              <strong className="text-white/80">AI-ын үүсгэсэн хариултууд</strong> нь таны бизнестэй
              холбоотойгоор ашиглах лицензтэйгээр танд олгогддог.
            </li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 7. Гуравдагч этгээдийн интеграци */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            7. Гуравдагч этгээдийн интеграци
          </h2>
          <p>
            Үйлчилгээ нь Meta (Facebook/Instagram) болон Anthropic (Claude AI) зэрэг гуравдагч
            этгээдийн платформуудтай интеграцчилдаг. Эдгээр интеграцийг ашиглахдаа тэдгээрийн
            үйлчилгээний нөхцөл, бодлогыг мөн дагаж мөрдөх шаардлагатай. Гуравдагч этгээдийн
            үйлчилгээний тасалдал, өөрчлөлт, зогсолтод бид хариуцлага хүлээхгүй.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 8. Төлбөр */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            8. Төлбөр ба нэхэмжлэл
          </h2>
          <p>
            Үйлчилгээний зарим боломжууд төлбөртэй захиалга шаарддаг. Захиалга хийснээр та дараахийг
            зөвшөөрч байна:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Сонгосон багцдаа заасан хураамжийг төлөх</li>
            <li>
              Дэмжигдсэн төлбөрийн үйлчилгээ үзүүлэгчээр (QPay, SocialPay) хүчинтэй төлбөрийн
              мэдээлэл өгөх
            </li>
            <li>
              Захиалгын хураамж урьдчилан нэхэмжлэгддэг бөгөөд хуулиар шаардлагатай тохиолдлоос
              бусад тохиолдолд буцаагдахгүй
            </li>
          </ul>
          <p className="mt-4">
            Бид 30 хоногийн өмнө мэдэгдэл өгч үнийг өөрчлөх эрхтэй. Үнэ өөрчлөгдсөний дараа
            үйлчилгээг үргэлжлүүлэн ашиглах нь шинэ үнийг зөвшөөрсөнд тооцогдоно.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 9. Нууцлал */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            9. Өгөгдөл ба нууцлал
          </h2>
          <p>
            Таны үйлчилгээний хэрэглээг мөн бидний{" "}
            <a
              href="/privacy"
              className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              Нууцлалын бодлого
            </a>
            -оор зохицуулдаг бөгөөд энэ нь бидний өгөгдлийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг
            талаар тодорхойлдог. Үйлчилгээг ашигласнаар та тэнд заасан өгөгдлийн практикийг зөвшөөрч
            байна.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 10. Баталгаа */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            10. Баталгааны хязгаарлалт
          </h2>
          <p>
            Үйлчилгээг &ldquo;байгаа чигээр&rdquo; болон &ldquo;боломжтой үед&rdquo; гэсэн үндсэн
            дээр үзүүлдэг. Бид дараах зүйлсийн талаар илэрхий болон далд баталгаа гаргахгүй:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>Үйлчилгээний тасралтгүй, алдаагүй ажиллагаа</li>
            <li>
              AI-ын үүсгэсэн хариултуудын нарийвчлал, найдвартай байдал — хариултууд алдаа агуулж
              болох бөгөөд мэргэжлийн зөвлөгөө гэж үзэхгүй
            </li>
            <li>Гуравдагч этгээдийн интеграцийн хүртээмж</li>
          </ul>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 11. Хариуцлагын хязгаарлалт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            11. Хариуцлагын хязгаарлалт
          </h2>
          <p>
            Хуулиар зөвшөөрөгдсөн хамгийн их хэмжээгээр Vela AI нь таны үйлчилгээг ашигласан эсвэл
            ашиглаж чадаагүйгээс үүссэн шууд бус, санамсаргүй, онцгой, дагалдах, эсвэл торгуулийн
            хохиролд, тэр дундаа ашиг, өгөгдөл, бизнесийн боломж алдахад хариуцлага хүлээхгүй.
          </p>
          <p className="mt-4">
            Үйлчилгээнээс үүссэн аливаа нэхэмжлэлийн нийт хариуцлага нь нэхэмжлэлийн өмнөх 12 сарын
            хугацаанд та бидэнд төлсөн дүнгээс хэтрэхгүй.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 12. Цуцлалт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            12. Цуцлалт
          </h2>
          <p>
            Аль ч тал хүссэн үедээ гэрээг цуцалж болно. Та хяналтын самбарын тохиргооноос эсвэл
            бидэнтэй холбогдож бүртгэлээ хаах боломжтой. Та эдгээр нөхцлийг зөрчвөл бид таны
            бүртгэлийг түдгэлзүүлэх эсвэл цуцлах эрхтэй.
          </p>
          <p className="mt-4">
            Цуцлагдсаны дараа таны өгөгдлийг манай{" "}
            <a
              href="/privacy"
              className="text-white/80 underline underline-offset-4 decoration-white/20 hover:decoration-white/50 transition-colors"
            >
              Нууцлалын бодлого
            </a>
            -д заасан хадгалах хугацааны дагуу зохицуулна.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 13. Хууль зүй */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            13. Хүчин төгөлдөр хууль
          </h2>
          <p>
            Энэхүү нөхцлийг Монгол Улсын хуулиар зохицуулж тайлбарлана. Энэхүү нөхцлөөс үүссэн
            аливаа маргааныг Улаанбаатар хотын шүүхээр шийдвэрлэнэ.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 14. Өөрчлөлт */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            14. Нөхцлийн өөрчлөлт
          </h2>
          <p>
            Бид энэхүү нөхцлийг хүссэн үедээ өөрчилж болно. Материаллаг өөрчлөлтийн тухай энэ
            хуудсан дээр шинэчилсэн нөхцлийг нийтэлж, &ldquo;Сүүлд шинэчилсэн&rdquo; огноог шинэчлэх
            замаар мэдэгдэнэ. Өөрчлөлтийн дараа үйлчилгээг үргэлжлүүлэн ашиглах нь шинэчилсэн
            нөхцлийг зөвшөөрсөнд тооцогдоно.
          </p>
        </section>

        <hr className="border-white/[0.06]" />

        {/* 15. Холбоо барих */}
        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] italic text-2xl text-white/90 mb-4">
            15. Холбоо барих
          </h2>
          <p>Энэхүү нөхцлийн талаар асуулт байвал бидэнтэй холбогдоно уу:</p>
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
