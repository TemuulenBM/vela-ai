import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `₮ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(price)}`;
}

export function formatDay(day: string): string {
  const d = new Date(day);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const d = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "Одоо";
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Одоо";
  if (diffMin < 60) return `${diffMin} мин`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} цаг`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Өчигдөр";
  if (diffDay < 7) return `${diffDay} өдөр`;
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
