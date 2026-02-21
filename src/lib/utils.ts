import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

export function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR").format(value || 0);
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) return "0%";
  return `${value.toFixed(1)}%`;
}
