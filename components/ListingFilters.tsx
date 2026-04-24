"use client";

import { useTranslation } from "react-i18next";
import { LISTING_CATEGORIES } from "@/types";
import type { FilterState } from "@/hooks/useListingFilters";

interface Props {
  filters: FilterState;
  setFilter: <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => void;
  reset: () => void;
  activeCount: number;
  totalShown: number;
}

// Borderless input — lives inside the white card
const FIELD =
  "h-11 w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none";

export default function ListingFilters({
  filters,
  setFilter,
  reset,
  activeCount,
  totalShown,
}: Props) {
  const { t } = useTranslation();

  const TYPE_OPTIONS: { label: string; value: FilterState["type"] }[] = [
    { label: t("listings.filter.all"), value: "" },
    { label: t("listings.badge.sale"), value: "sale" },
    { label: t("listings.badge.rent"), value: "rent" },
  ];
  return (
    <div className="w-full space-y-3">
      {/* ── Card ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_32px_rgba(0,0,0,0.07)] overflow-hidden">
        {/* Desktop: single horizontal row */}
        <div className="hidden lg:flex items-stretch divide-x divide-gray-100 min-h-[56px]">
          {/* Search */}
          <div className="flex items-center flex-1 min-w-0 px-5 gap-3">
            <svg
              className="shrink-0 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx={11} cy={11} r={7} />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={t("listings.filter.search")}
              value={filters.keyword}
              onChange={(e) => setFilter("keyword", e.target.value)}
              className={FIELD}
            />
          </div>

          {/* Category */}
          <div className="flex items-center px-5 min-w-[200px]">
            <select
              value={filters.category}
              onChange={(e) => setFilter("category", e.target.value)}
              className={
                FIELD +
                " cursor-pointer appearance-none pr-5 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:16px] bg-no-repeat bg-[right_0px_center]"
              }
            >
              <option value="">{t("listings.filter.allCategories")}</option>
              {LISTING_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="flex items-center px-5 min-w-[180px] gap-3">
            <svg
              className="shrink-0 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
              />
              <circle cx={12} cy={9} r={2.5} />
            </svg>
            <input
              type="text"
              placeholder={t("listings.filter.location")}
              value={filters.location}
              onChange={(e) => setFilter("location", e.target.value)}
              className={FIELD}
            />
          </div>

          {/* Type pills */}
          <div className="flex items-center px-5 gap-2 shrink-0">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFilter("type", o.value)}
                className={`h-8 rounded-full px-4 text-sm font-medium transition-all ${
                  filters.type === o.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: stacked rows */}
        <div className="lg:hidden divide-y divide-gray-100">
          {/* Search */}
          <div className="flex items-center px-4 gap-3">
            <svg
              className="shrink-0 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx={11} cy={11} r={7} />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder={t("listings.filter.search")}
              value={filters.keyword}
              onChange={(e) => setFilter("keyword", e.target.value)}
              className={FIELD}
            />
          </div>

          {/* Type pills */}
          <div className="flex items-center gap-2 px-4 py-3">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setFilter("type", o.value)}
                className={`flex-1 h-9 rounded-full text-sm font-medium transition-all ${
                  filters.type === o.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>

          {/* Category + Location side by side */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="flex items-center px-4">
              <select
                value={filters.category}
                onChange={(e) => setFilter("category", e.target.value)}
                className={
                  FIELD +
                  " cursor-pointer appearance-none pr-5 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")] bg-[length:16px] bg-no-repeat bg-[right_0px_center]"
                }
              >
                <option value="">{t("listings.filter.category")}</option>
                {LISTING_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center px-4">
              <input
                type="text"
                placeholder={t("listings.filter.location")}
                value={filters.location}
                onChange={(e) => setFilter("location", e.target.value)}
                className={FIELD}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Active filter chips ─────────────────────────────────────────── */}
      {activeCount > 0 && (
        <div className="flex flex-wrap gap-2 px-1">
          {filters.keyword && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
              🔍 {filters.keyword}
              <button
                onClick={() => setFilter("keyword", "")}
                className="hover:text-blue-900 transition-colors ml-0.5"
                aria-label="Remove keyword filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.type && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
              {filters.type === "sale"
                ? `🏷 ${t("listings.badge.sale")}`
                : `🔑 ${t("listings.badge.rent")}`}
              <button
                onClick={() => setFilter("type", "")}
                className="hover:text-blue-900 transition-colors ml-0.5"
                aria-label="Remove type filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.category && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
              🏠 {filters.category}
              <button
                onClick={() => setFilter("category", "")}
                className="hover:text-blue-900 transition-colors ml-0.5"
                aria-label="Remove category filter"
              >
                ×
              </button>
            </span>
          )}
          {filters.location && (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full">
              📍 {filters.location}
              <button
                onClick={() => setFilter("location", "")}
                className="hover:text-blue-900 transition-colors ml-0.5"
                aria-label="Remove location filter"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}

      {/* ── Footer: count + clear ───────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-sm text-gray-400" suppressHydrationWarning>
          <span className="font-semibold text-gray-700">{totalShown}</span>{" "}
          {t("listings.filter.found")}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-500 border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-full transition-all"
            suppressHydrationWarning
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t("listings.clearFilters")}
          </button>
        )}
      </div>
    </div>
  );
}
