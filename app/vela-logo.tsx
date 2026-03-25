import Link from "next/link";

export function VelaLogo({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 group ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-white transition-transform duration-300 group-hover:scale-110"
      >
        {/* Sail shape */}
        <path
          d="M12 3C12 3 5 11 5 17c0 1.5 0.8 2 2 2h10c1.2 0 2-0.5 2-2C19 11 12 3 12 3z"
          fill="currentColor"
          opacity="0.15"
        />
        <path
          d="M12 3C12 3 5 11 5 17c0 1.5 0.8 2 2 2h10c1.2 0 2-0.5 2-2C19 11 12 3 12 3z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
        {/* Mast line */}
        <path
          d="M12 3v18"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
      <span className="font-serif italic text-white text-lg">Vela AI</span>
    </Link>
  );
}
