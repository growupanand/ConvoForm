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

export function formatDateTime(input: string | number): string {
  const date = new Date(input);
  return date.toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// get time ago from date
export function timeAgo(date: string | number | Date) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  let interval = seconds / 31536000;
  if (interval > 1) {
    return `${Math.floor(interval)} years ago`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} months ago`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)} days ago`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)} hours ago`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} minutes ago`;
  }
  return `${Math.floor(seconds)} seconds ago`;
}

let timeoutId: ReturnType<typeof setTimeout> | undefined;
export function debounce(callback: () => void, ms?: number | undefined) {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(callback, ms);
}

export const isValidJSON = (str: string) => {
  try {
    JSON.parse(str);
    return true;
  } catch (_) {
    return false;
  }
};

export const timeout = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export function numberFormatter(value: number) {
  const formatter = Intl.NumberFormat("en", { notation: "compact" });
  return formatter.format(value);
}

// Format a duration in milliseconds to a readable string
export function formatDuration(milliseconds: number, abbreviated = false) {
  const seconds = Math.floor(milliseconds / 1000);

  // Labels based on abbreviated parameter
  const secondsLabel = abbreviated ? "sec" : "seconds";
  const minutesLabel = abbreviated ? "min" : "minutes";
  const hoursLabel = abbreviated ? "hr" : "hours";
  const daysLabel = abbreviated
    ? (days: number) => `day${days !== 1 ? "s" : ""}`
    : () => "days";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 1) {
    return `${seconds} ${secondsLabel}`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 1) {
    return `${minutes} ${minutesLabel}${seconds % 60 > 0 ? ` ${seconds % 60} ${secondsLabel}` : ""}`;
  }

  const days = Math.floor(hours / 24);
  if (days < 1) {
    return `${hours} ${hoursLabel}${minutes % 60 > 0 ? ` ${minutes % 60} ${minutesLabel}` : ""}`;
  }

  return `${days} ${daysLabel(days)}${hours % 24 > 0 ? ` ${hours % 24} ${hoursLabel}` : ""}`;
}
