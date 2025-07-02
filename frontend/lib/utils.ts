import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a price value as a currency string (Rs for Nepal, fallback to USD if needed).
 * Handles null, undefined, or invalid values gracefully.
 */
export function formatPrice(price: number | null | undefined, currency: 'NPR' | 'USD' = 'NPR'): string {
  if (price == null || isNaN(price) || price < 0) {
    return 'Price not available';
  }
  if (currency === 'NPR') {
    // Rs with Indian-style grouping
    return `Rs${Math.round(price).toLocaleString('en-IN')}`;
  }
  // Fallback to USD
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

/**
 * Calculates the discount percentage between original and discounted/final price.
 * Returns null if not a valid discount.
 */
export function calculateDiscount(original: number | null | undefined, discounted: number | null | undefined): number | null {
  if (
    original == null || discounted == null ||
    isNaN(original) || isNaN(discounted) ||
    original <= 0 || discounted >= original
  ) {
    return null;
  }
  return Math.round(((original - discounted) / original) * 100);
}
