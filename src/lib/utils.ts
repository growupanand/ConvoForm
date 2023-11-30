import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

let timeoutId: ReturnType<typeof setTimeout> | undefined;
export function debounce(callback: () => void, ms?: number | undefined) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(callback, ms);
}
