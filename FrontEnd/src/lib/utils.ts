import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const locationTypeLabels: Record<string, string> = {
  house: "خانه",
  room: "اتاق",
  storage: "انبار",
  shelf: "قفسه",
  container: "ظرف",
  box: "جعبه",
  item: "آیتم",
  other: "سایر",
};

export const locationTypeIcons: Record<string, string> = {
  house: "home",
  room: "door-open",
  storage: "warehouse",
  shelf: "bookmark",
  container: "package",
  box: "box",
  item: "tag",
  other: "more-horizontal",
};

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} دقیقه`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours} ساعت و ${remainingMinutes} دقیقه`
    : `${hours} ساعت`;
}

export function formatDays(days: number): string {
  if (days === 1) {
    return "1 روز";
  }
  return `${days} روز`;
}

export function getCleaningStatus(
  cleanedTime?: string,
  cleanedDuration?: number
): {
  status: "clean" | "needs_cleaning" | "unknown";
  message: string;
} {
  if (!cleanedTime || !cleanedDuration) {
    return { status: "unknown", message: "وضعیت نامشخص" };
  }

  const cleanedDate = new Date(cleanedTime);
  const now = new Date();
  const timeDiff = now.getTime() - cleanedDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const cleaningIntervalDays = cleanedDuration; // cleaned_duration now represents days directly

  if (daysDiff >= cleaningIntervalDays) {
    return {
      status: "needs_cleaning",
      message: `نیاز به تمیزکاری (${daysDiff} روز از آخرین تمیزکاری)`,
    };
  }

  const remainingDays = cleaningIntervalDays - daysDiff;
  return {
    status: "clean",
    message: `تمیز (${remainingDays} روز تا تمیزکاری بعدی)`,
  };
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateBreadcrumbFromPath(
  path: string
): Array<{ name: string }> {
  return path.split(" > ").map((name) => ({ name: name.trim() }));
}
