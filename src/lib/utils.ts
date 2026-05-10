import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format amount as LKR (Sri Lankan Rupees) for display across the app */
export function formatCurrency(amount: number): string {
  return "LKR " + amount.toLocaleString();
}

/** Calculate deposit amount based on vehicle category (between 30,000 and 100,000) */
export function getDepositAmount(vehicleType: string): number {
  const type = vehicleType.toLowerCase();
  if (type.includes("suv")) return 100000;
  if (type.includes("van") || type.includes("minivan")) return 75000;
  if (type.includes("car") || type.includes("sedan") || type.includes("hatchback")) return 50000;
  return 30000; // Default for others (e.g. bikes, tutuks, etc.)
}
