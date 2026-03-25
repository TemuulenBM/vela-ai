"use client";

export function HeroVideo() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 z-0 w-full h-full object-cover opacity-25"
    >
      <source src="/videos/hero-bg.mp4" type="video/mp4" />
    </video>
  );
}
