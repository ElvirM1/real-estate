export type ListingStatus = "active" | "sold";
export type ListingType = "sale" | "rent";

export const LISTING_CATEGORIES = [
  "Shtëpi",
  "Banesë",
  "Zyrë",
  "Lokale",
  "Troje",
  "Depo",
  "Objekte",
] as const;
export type ListingCategory = (typeof LISTING_CATEGORIES)[number];

export interface ListingFeatures {
  rooms?: string;
  bathrooms?: string;
  parking?: string;
  orientation?: string;
  heating?: string;
  floor?: string;
  area?: string;
}

export interface Listing {
  id: string;
  /** Human-readable display ID, e.g. "PR-A3F2K" */
  listingId: string;
  title: string;
  price: string;
  /** Numeric price for sorting/filtering — derived from price string on write */
  priceValue?: number;
  type: ListingType;
  category?: ListingCategory;
  location: string;
  description: string;
  images: string[];
  features: ListingFeatures;
  /** Numeric area in m² for filtering — derived from features.area on write */
  areaValue?: number;
  status: ListingStatus;
  createdAt: { seconds: number; nanoseconds: number } | null;
  expiresAt: { seconds: number; nanoseconds: number } | null;
}

export type ListingFormData = Omit<
  Listing,
  "id" | "listingId" | "createdAt" | "expiresAt" | "status"
>;

/** Computed display status — expired is derived from expiresAt, not stored */
export type DisplayStatus = "active" | "expired" | "sold";

export function getDisplayStatus(listing: Listing): DisplayStatus {
  if (listing.status === "sold") return "sold";
  if (listing.expiresAt && Date.now() / 1000 > listing.expiresAt.seconds) {
    return "expired";
  }
  return "active";
}

export interface AdminUser {
  uid: string;
  email: string | null;
}
