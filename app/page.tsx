"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ListingCard } from "@/components/ListingCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import ListingFilters from "@/components/ListingFilters";
import { Footer } from "@/components/Footer";
import { getListingsPage, getActiveListingsCount } from "@/lib/firestore";
import { useListingFilters } from "@/hooks/useListingFilters";
import type { Listing } from "@/types";
import type { DocumentSnapshot } from "firebase/firestore";

export default function HomePage() {
  const { t } = useTranslation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingCount, setListingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [cursor, setCursor] = useState<DocumentSnapshot | undefined>(undefined);
  const [hasMore, setHasMore] = useState(false);
  const [gridCols, setGridCols] = useState<3 | 4>(() => {
    if (typeof window === "undefined") return 4;
    const saved = localStorage.getItem("gridCols");
    return saved === "3" ? 3 : 4;
  });

  const handleGridChange = (cols: 3 | 4) => {
    setGridCols(cols);
    localStorage.setItem("gridCols", String(cols));
  };

  const { filters, setFilter, reset, activeCount, filtered } =
    useListingFilters(listings);

  useEffect(() => {
    getActiveListingsCount()
      .then(setListingCount)
      .catch(() => {
        /* fail silently — counter shows "—" */
      });

    getListingsPage()
      .then(({ listings: page, nextCursor, hasMore }) => {
        setListings(page);
        setCursor(nextCursor);
        setHasMore(hasMore);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const {
        listings: page,
        nextCursor,
        hasMore,
      } = await getListingsPage(cursor);
      setListings((prev) => [...prev, ...page]);
      setCursor(nextCursor);
      setHasMore(hasMore);
    } catch {
      // fail silently — user can retry
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore]);

  return (
    <>
      <Navbar />
      <HeroSection listingCount={listingCount} />

      {/* ── Sticky filter bar ─────────────────────────────────────────── */}
      {!loading && !error && listings.length > 0 && (
        <div className="sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-md border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <ListingFilters
              filters={filters}
              setFilter={setFilter}
              reset={reset}
              activeCount={activeCount}
              totalShown={filtered.length}
            />
          </div>
        </div>
      )}

      <main
        id="listings"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
      >
        {/* Section header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
          <div className="text-center flex-1">
            <h2
              className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3"
              suppressHydrationWarning
            >
              {t("listings.title")}
            </h2>
            <p
              className="text-gray-500 text-lg max-w-xl mx-auto"
              suppressHydrationWarning
            >
              {t("listings.subtitle")}
            </p>
          </div>
          {/* Grid toggle — only show when listings are visible */}
          {!loading && !error && filtered.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-xl flex-shrink-0">
              <button
                onClick={() => handleGridChange(3)}
                title="3 columns"
                className={`p-2 rounded-lg transition-all duration-150 ${gridCols === 3 ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="4"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                  <rect
                    x="6"
                    y="1"
                    width="4"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                  <rect
                    x="11"
                    y="1"
                    width="4"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleGridChange(4)}
                title="4 columns"
                className={`p-2 rounded-lg transition-all duration-150 ${gridCols === 4 ? "bg-white shadow-sm text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="3"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                  <rect
                    x="5"
                    y="1"
                    width="3"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                  <rect
                    x="9"
                    y="1"
                    width="3"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                  <rect
                    x="13"
                    y="1"
                    width="3"
                    height="14"
                    rx="1"
                    fill="currentColor"
                    fillOpacity=".8"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500" suppressHydrationWarning>
              {t("common.error")}
            </p>
          </div>
        ) : filtered.length === 0 && listings.length > 0 ? (
          <div className="text-center py-20 space-y-4">
            <p className="text-gray-400 text-lg" suppressHydrationWarning>
              {t("listings.noResults")}
            </p>
            <button
              onClick={reset}
              className="text-sm font-medium text-blue-600 hover:underline"
              suppressHydrationWarning
            >
              {t("listings.clearFilters")}
            </button>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg" suppressHydrationWarning>
              {t("listings.noListings")}
            </p>
          </div>
        ) : (
          <>
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-6 transition-all duration-300 ${
                gridCols === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
              }`}
            >
              {filtered.map((listing, i) => (
                <div
                  key={listing.id}
                  className="animate-slide-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <ListingCard listing={listing} />
                </div>
              ))}
            </div>

            {/* Load more — only shown when no active filters */}
            {hasMore && activeCount === 0 && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-gray-200 text-sm font-medium text-gray-700 rounded-2xl hover:border-blue-300 hover:text-blue-600 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  suppressHydrationWarning
                >
                  {loadingMore ? t("common.loading") : t("listings.loadMore")}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}
