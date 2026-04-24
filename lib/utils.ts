/**
 * Returns true when a price string represents a negotiable/on-request price.
 */
export function isNegotiablePrice(price: string): boolean {
  return price === "Me marrëveshje";
}

/**
 * Formats a raw price string for display:
 *  - "Me marrëveshje" → returned unchanged
 *  - "85000", "€85,000", "85.000" → "€85,000"
 *  - Any string with no digits → returned unchanged
 *
 * Uses regex-based formatting (no toLocaleString) to avoid SSR/locale mismatches.
 */
export function formatPrice(price: string): string {
  if (!price) return price;
  if (isNegotiablePrice(price)) return price;

  const digits = price.replace(/[^\d]/g, "");
  if (!digits) return price;

  const num = parseInt(digits, 10);
  const formatted = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `€${formatted}`;
}

/**
 * Formats a Firestore Timestamp-like object { seconds, nanoseconds } as a
 * locale date string. Returns an empty string if the timestamp is missing.
 */
export function formatTimestamp(
  ts: { seconds: number; nanoseconds: number } | null | undefined,
): string {
  if (!ts?.seconds) return "";
  return new Date(ts.seconds * 1000).toLocaleDateString();
}
