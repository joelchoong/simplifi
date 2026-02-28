import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumberInput(value: string | number): string {
  if (!value && value !== 0) return "";
  const stringValue = value.toString();
  // Remove non-digit chars except for decimal point
  const cleanValue = stringValue.replace(/[^\d.]/g, "");

  // Split into integer and decimal parts
  const parts = cleanValue.split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.join(".");
}

export function parseNumberInput(value: string): string {
  // Remove all commas
  return value.replace(/,/g, "");
}
