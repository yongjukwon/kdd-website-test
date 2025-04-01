import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names into a single string
 * Resolves conflicting Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
