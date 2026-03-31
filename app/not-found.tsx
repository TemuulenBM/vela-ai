import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-8">
      <div className="flex flex-col items-center gap-6 max-w-md text-center">
        <p className="text-6xl font-light text-white/10 tracking-tighter select-none">404</p>

        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-semibold tracking-tight">Хуудас олдсонгүй</h1>
          <p className="text-sm text-white/50 leading-relaxed">
            Та хайж буй хуудас устгагдсан эсвэл хаяг өөрчлөгдсөн байж магадгүй.
          </p>
        </div>

        <Link
          href="/"
          className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}
