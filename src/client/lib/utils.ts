import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fileSizeFormatter = new Intl.NumberFormat("en");

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${fileSizeFormatter.format(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${(kb).toFixed(1).replace(/\.0$/, "")} KB`;
  const mb = kb / 1024;
  return `${(mb).toFixed(1).replace(/\.0$/, "")} MB`;
}
