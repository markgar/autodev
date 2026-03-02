import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fileSizeFormatter = new Intl.NumberFormat("en");
const fileSizeDecimalFormatter = new Intl.NumberFormat("en", { maximumFractionDigits: 1 });

export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${fileSizeFormatter.format(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${fileSizeDecimalFormatter.format(kb)} KB`;
  const mb = kb / 1024;
  return `${fileSizeDecimalFormatter.format(mb)} MB`;
}
