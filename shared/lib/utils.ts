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
