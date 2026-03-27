import Link from "next/link";
import { VelaLogo } from "../vela-logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] backdrop-blur-xl bg-black/60">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <VelaLogo size={18} />
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            Нүүр хуудас
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16 sm:py-24">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Vela AI</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/20 hover:text-white/40 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
