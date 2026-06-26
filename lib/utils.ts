import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind CSS classes dynamically, resolving any utility conflicts safely.
 * This is the foundational utility for building premium, reusable UI components
 * where dynamic states (e.g., dark mode toggles, error states, hover effects) 
 * might otherwise collide with base styles.
 *
 * @param inputs - An array of class values, objects, or conditional arrays.
 * @returns A conflict-free string of merged Tailwind classes.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}