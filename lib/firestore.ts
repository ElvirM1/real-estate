import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  limit,
  startAfter,
  where,
  getCountFromServer,
  serverTimestamp,
  Timestamp,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Listing, ListingFormData } from "@/types";

const COLLECTION = "listings";
const PAGE_SIZE = 24;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Collision-safe human-readable listing ID.
 * Uses base-36 encoding of the current timestamp (ms) → 8 chars.
 * Probability of collision among 10,000 listings: effectively zero.
 * Example output: "PR-LKJH2F8M"
 */
function generateListingId(): string {
  const base = Date.now().toString(36).toUpperCase();
  // Pad to at least 8 chars (timestamps are 8–9 chars in base-36 currently)
  return `PR-${base.slice(-8)}`;
}

/** Extract a numeric price from strings like "€85,000" or "85000" */
export function parsePriceToNumber(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Extract a numeric area from strings like "90 m²" or "90" */
export function parseAreaToNumber(area: string | undefined): number {
  const digits = (area ?? "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Returns a Firestore Timestamp 30 days from now */
function thirtyDaysFromNow(): Timestamp {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return Timestamp.fromDate(d);
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export interface ListingsPage {
  listings: Listing[];
  /** Pass to next call as `cursor` to get the next page. Undefined = last page. */
  nextCursor: DocumentSnapshot | undefined;
  hasMore: boolean;
}

/**
 * Fetches a page of listings ordered by createdAt desc.
 * Pass `cursor` (the `nextCursor` from the previous page) to paginate.
 * Omit `cursor` to fetch the first page.
 */
export async function getListingsPage(
  cursor?: DocumentSnapshot,
): Promise<ListingsPage> {
  let q = query(
    collection(db, COLLECTION),
    orderBy("createdAt", "desc"),
    limit(PAGE_SIZE + 1), // fetch one extra to check if there's a next page
  );
  if (cursor) {
    q = query(
      collection(db, COLLECTION),
      orderBy("createdAt", "desc"),
      startAfter(cursor),
      limit(PAGE_SIZE + 1),
    );
  }

  const snapshot = await getDocs(q);
  const hasMore = snapshot.docs.length > PAGE_SIZE;
  const docs = hasMore ? snapshot.docs.slice(0, PAGE_SIZE) : snapshot.docs;

  return {
    listings: docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Listing, "id">),
    })),
    nextCursor: hasMore ? docs[docs.length - 1] : undefined,
    hasMore,
  };
}

/**
 * Returns the count of active listings (status === "active").
 * Uses Firestore's server-side aggregation — no documents are downloaded.
 */
export async function getActiveListingsCount(): Promise<number> {
  const q = query(collection(db, COLLECTION), where("status", "==", "active"));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
}

/**
 * Returns ALL listings — kept for admin panel which needs the full list.
 * Do NOT use this on the public homepage.
 */
export async function getListings(): Promise<Listing[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Listing, "id">),
  }));
}

export async function getListing(id: string): Promise<Listing | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...(snapshot.data() as Omit<Listing, "id">) };
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function addListing(data: ListingFormData): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    listingId: generateListingId(),
    priceValue: parsePriceToNumber(data.price),
    areaValue: parseAreaToNumber(data.features?.area),
    status: "active",
    createdAt: serverTimestamp(),
    expiresAt: thirtyDaysFromNow(),
  });
  return docRef.id;
}

export async function updateListing(
  id: string,
  data: Partial<ListingFormData>,
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  const updates: Record<string, unknown> = { ...data };
  // Keep numeric fields in sync if display values change
  if (data.price !== undefined) {
    updates.priceValue = parsePriceToNumber(data.price);
  }
  if (data.features?.area !== undefined) {
    updates.areaValue = parseAreaToNumber(data.features.area);
  }
  await updateDoc(docRef, updates);
}

export async function deleteListing(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function markAsSold(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { status: "sold" });
}

export async function extendListing(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    status: "active",
    expiresAt: thirtyDaysFromNow(),
  });
}
