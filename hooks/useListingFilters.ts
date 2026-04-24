import { useState, useMemo, useCallback } from "react";
import type { Listing } from "@/types";

// ─── Filter state shape ───────────────────────────────────────────────────────

export interface FilterState {
  keyword: string;
  type: "" | "sale" | "rent";
  category: string;
  location: string;
  priceMin: string;
  priceMax: string;
  areaMin: string;
  areaMax: string;
}

const EMPTY_FILTERS: FilterState = {
  keyword: "",
  type: "",
  category: "",
  location: "",
  priceMin: "",
  priceMax: "",
  areaMin: "",
  areaMax: "",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract numeric value from a price string like "€150,000" or "95000" */
function parsePrice(price: string): number {
  const digits = price.replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Extract numeric area from features.area like "90" or "90 m²" */
function parseArea(area: string | undefined): number {
  const digits = (area ?? "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** Count how many filters are active (non-empty) */
export function countActiveFilters(f: FilterState): number {
  return Object.values(f).filter((v) => v !== "").length;
}

// ─── The hook ─────────────────────────────────────────────────────────────────

export function useListingFilters(listings: Listing[]) {
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);

  const setFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const reset = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const filtered = useMemo(() => {
    // Only surface active listings to the public
    let result = listings.filter((l) => l.status === "active");

    // Keyword: matched against title, description, location, listingId
    const kw = filters.keyword.toLowerCase().trim();
    if (kw) {
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(kw) ||
          (l.description ?? "").toLowerCase().includes(kw) ||
          l.location.toLowerCase().includes(kw) ||
          (l.listingId ?? "").toLowerCase().includes(kw),
      );
    }

    // Type: sale / rent
    if (filters.type) {
      result = result.filter((l) => l.type === filters.type);
    }

    // Category: stored field OR fallback keyword match in title
    if (filters.category) {
      const cat = filters.category.toLowerCase();
      result = result.filter(
        (l) =>
          (l.category ?? "").toLowerCase() === cat ||
          l.title.toLowerCase().includes(cat),
      );
    }

    // Location: substring match
    if (filters.location.trim()) {
      const loc = filters.location.toLowerCase().trim();
      result = result.filter((l) => l.location.toLowerCase().includes(loc));
    }

    // Price range
    if (filters.priceMin) {
      const min = parseInt(filters.priceMin, 10);
      if (!isNaN(min)) {
        result = result.filter((l) => parsePrice(l.price) >= min);
      }
    }
    if (filters.priceMax) {
      const max = parseInt(filters.priceMax, 10);
      if (!isNaN(max)) {
        result = result.filter((l) => parsePrice(l.price) <= max);
      }
    }

    // Area range
    if (filters.areaMin) {
      const min = parseInt(filters.areaMin, 10);
      if (!isNaN(min)) {
        result = result.filter((l) => parseArea(l.features?.area) >= min);
      }
    }
    if (filters.areaMax) {
      const max = parseInt(filters.areaMax, 10);
      if (!isNaN(max)) {
        result = result.filter((l) => parseArea(l.features?.area) <= max);
      }
    }

    return result;
  }, [listings, filters]);

  return { filters, setFilter, reset, activeCount, filtered };
}
