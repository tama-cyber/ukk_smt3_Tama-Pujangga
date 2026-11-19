import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Fungsi utilitas untuk menggabungkan class Tailwind CSS dengan aman
 * (Biasanya digunakan oleh komponen UI seperti shadcn/ui)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}