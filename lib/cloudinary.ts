/**
 * Cloudinary delivery URL optimizer.
 *
 * Inserts f_auto,q_auto,w_{width} into a Cloudinary URL so the browser
 * always gets the best format (WebP/AVIF) at the right size.
 *
 * One unique URL per (image × width) → one cached transformation.
 * Use a fixed set of widths (400, 800, 1200) to avoid generating
 * thousands of variants.
 */

const CLOUDINARY_UPLOAD_PATH = "/upload/";

export const IMG_WIDTHS = {
  /** Thumbnails in admin form, image count badges */
  thumb: 400,
  /** ListingCard grid images */
  card: 800,
  /** Full detail page / gallery main image */
  full: 1200,
} as const;

export type ImgWidth = (typeof IMG_WIDTHS)[keyof typeof IMG_WIDTHS];

/**
 * Returns a Cloudinary URL with automatic format + quality optimizations.
 * Safe to call on non-Cloudinary URLs — returns them unchanged.
 */
export function optimizeUrl(
  url: string,
  width: ImgWidth = IMG_WIDTHS.card,
): string {
  if (!url || !url.includes("res.cloudinary.com")) return url;
  // Avoid double-transforming already-optimized URLs
  if (url.includes("/f_auto,")) return url;
  return url.replace(
    CLOUDINARY_UPLOAD_PATH,
    `${CLOUDINARY_UPLOAD_PATH}f_auto,q_auto,w_${width}/`,
  );
}
