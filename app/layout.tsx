import type { Metadata } from "next";
import { Cormorant, Manrope, Raleway } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Vela AI — AI Борлуулалтын Туслах",
  description: "Монголын e-commerce-д зориулсан AI борлуулалтын туслах",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mn"
      className={`${cormorant.variable} ${manrope.variable} ${raleway.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-black text-white antialiased">{children}</body>
    </html>
  );
}
