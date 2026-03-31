"use client";

import { useEffect } from "react";
import { Cormorant, Manrope, Raleway } from "next/font/google";
import { ErrorIcon } from "@/shared/components/ui/error-icon";

const cormorant = Cormorant({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
  weight: ["400", "600"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["300", "400", "600"],
  display: "swap",
});

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin", "cyrillic", "latin-ext"],
  weight: ["600", "700"],
  display: "swap",
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Sentry суулгасны дараа captureException(error) болгоно
    console.error(error);
  }, [error]);

  return (
    <html
      lang="mn"
      className={`${cormorant.variable} ${manrope.variable} ${raleway.variable} h-full`}
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen flex flex-col items-center justify-center bg-black text-white antialiased p-8">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <ErrorIcon size={20} />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold tracking-tight">Системийн алдаа гарлаа</h1>
            <p className="text-sm text-white/50 leading-relaxed">
              Гэнэтийн алдаа гарсан байна. Дахин оролдоно уу.
            </p>
            {error.digest && (
              <p className="text-xs text-white/25 font-mono mt-1">Код: {error.digest}</p>
            )}
          </div>

          <button
            type="button"
            onClick={reset}
            className="px-4 py-2 text-sm font-medium bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors cursor-pointer"
          >
            Дахин оролдох
          </button>
        </div>
      </body>
    </html>
  );
}
