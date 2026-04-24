"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineLogout,
  HiOutlineHome,
  HiLocationMarker,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineRefresh,
} from "react-icons/hi";
import { useAuth } from "@/contexts/AuthContext";
import {
  getListings,
  deleteListing,
  markAsSold,
  extendListing,
} from "@/lib/firestore";
import { AdminListingForm } from "./AdminListingForm";
import { getDisplayStatus, type Listing, type DisplayStatus } from "@/types";

type View = "list" | "add" | "edit";
type FilterTab = "all" | "active" | "expired" | "sold";

// ─── Small helpers ────────────────────────────────────────────────────────────

function formatDate(ts: Listing["expiresAt"]): string {
  if (!ts?.seconds) return "—";
  return new Date(ts.seconds * 1000).toLocaleDateString();
}

function daysLeft(ts: Listing["expiresAt"]): number {
  if (!ts?.seconds) return 0;
  return Math.ceil((ts.seconds * 1000 - Date.now()) / 86_400_000);
}

function StatusBadge({ status }: { status: DisplayStatus }) {
  const map: Record<DisplayStatus, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-green-100 text-green-700" },
    expired: { label: "Expired", cls: "bg-red-100 text-red-700" },
    sold: { label: "Sold", cls: "bg-gray-100 text-gray-600" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("list");
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      setListings(await getListings());
    } catch {
      toast.error(t("common.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // ── filtered view ──
  const displayed = listings.filter((l) => {
    if (filter === "all") return true;
    return getDisplayStatus(l) === filter;
  });

  const counts: Record<FilterTab, number> = {
    all: listings.length,
    active: listings.filter((l) => getDisplayStatus(l) === "active").length,
    expired: listings.filter((l) => getDisplayStatus(l) === "expired").length,
    sold: listings.filter((l) => getDisplayStatus(l) === "sold").length,
  };

  // ── actions ──
  const handleEdit = (listing: Listing) => {
    setEditingListing(listing);
    setView("edit");
  };

  const handleDelete = async (listing: Listing) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently delete "${listing.title}"?`,
      )
    )
      return;
    setBusyId(listing.id);
    try {
      await deleteListing(listing.id);
      toast.success("Listing deleted.");
      await fetchListings();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkSold = async (listing: Listing) => {
    if (
      !window.confirm(
        `Mark "${listing.title}" as sold? It will be hidden from active listings.`,
      )
    )
      return;
    setBusyId(listing.id);
    try {
      await markAsSold(listing.id);
      toast.success("Marked as sold!");
      await fetchListings();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const handleExtend = async (listing: Listing) => {
    setBusyId(listing.id);
    try {
      await extendListing(listing.id);
      toast.success("Listing extended by 30 days!");
      await fetchListings();
    } catch {
      toast.error(t("common.error"));
    } finally {
      setBusyId(null);
    }
  };

  const handleFormSuccess = async () => {
    setView("list");
    setEditingListing(null);
    await fetchListings();
  };

  const handleFormCancel = () => {
    setView("list");
    setEditingListing(null);
  };

  // ── render ──
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <HiOutlineHome className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Admin Panel</p>
              <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <HiOutlineLogout className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {view === "list" ? (
          <>
            {/* Page title + Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                My Properties
              </h1>
              <button
                onClick={() => setView("add")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl transition-all hover:shadow-lg active:scale-95 text-base"
              >
                <HiOutlinePlus className="w-5 h-5" />
                Add New Property
              </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {(["all", "active", "expired", "sold"] as FilterTab[]).map(
                (tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                      filter === tab
                        ? "bg-blue-600 text-white shadow"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab === "all"
                      ? "All"
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span
                      className={`ml-1.5 text-xs ${
                        filter === tab ? "text-blue-200" : "text-gray-400"
                      }`}
                    >
                      ({counts[tab]})
                    </span>
                  </button>
                ),
              )}
            </div>

            {/* Expired alert banner */}
            {counts.expired > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-semibold text-red-800">
                    {counts.expired} listing{counts.expired > 1 ? "s" : ""} have
                    expired
                  </p>
                  <p className="text-sm mt-0.5 text-red-600">
                    These properties are no longer visible to visitors. You can
                    extend them for 30 more days or mark them as sold.
                  </p>
                </div>
              </div>
            )}

            {/* List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-card">
                <HiOutlineHome className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">
                  No properties here yet.
                </p>
                {filter === "all" && (
                  <button
                    onClick={() => setView("add")}
                    className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-2xl hover:bg-blue-700 transition-colors"
                  >
                    <HiOutlinePlus className="w-5 h-5" />
                    Add Your First Property
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-5">
                {displayed.map((listing) => {
                  const status = getDisplayStatus(listing);
                  const busy = busyId === listing.id;
                  const days = daysLeft(listing.expiresAt);

                  return (
                    <div
                      key={listing.id}
                      className={`bg-white rounded-2xl overflow-hidden flex flex-col sm:flex-row shadow-card hover:shadow-card-hover transition-shadow ${
                        status === "expired"
                          ? "border-2 border-red-200"
                          : "border border-gray-100"
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="relative w-full sm:w-44 h-44 sm:h-auto flex-shrink-0 bg-gray-100">
                        {listing.images?.[0] ? (
                          <Image
                            src={listing.images[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 100vw, 176px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
                            <HiOutlineHome className="w-10 h-10 text-blue-200" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-5 flex flex-col gap-3">
                        {/* Title + badge */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-900 leading-snug">
                              {listing.title}
                            </h2>
                            {listing.listingId && (
                              <span className="inline-block mt-0.5 text-xs font-mono font-semibold text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                                {listing.listingId}
                              </span>
                            )}
                          </div>
                          <StatusBadge status={status} />
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="font-bold text-blue-600 text-base">
                            {listing.price}
                          </span>
                          <span className="flex items-center gap-1">
                            <HiLocationMarker className="w-4 h-4 text-blue-400" />
                            {listing.location}
                          </span>
                        </div>

                        {/* Expiry info */}
                        {listing.expiresAt && status !== "sold" && (
                          <div
                            className={`flex items-center gap-2 text-sm rounded-xl px-3 py-2 w-fit ${
                              status === "expired"
                                ? "bg-red-50 text-red-600"
                                : days <= 7
                                  ? "bg-orange-50 text-orange-600"
                                  : "bg-gray-50 text-gray-500"
                            }`}
                          >
                            <HiOutlineClock className="w-4 h-4 flex-shrink-0" />
                            {status === "expired" ? (
                              <span className="font-semibold">
                                Expired on {formatDate(listing.expiresAt)}
                              </span>
                            ) : (
                              <span>
                                Active until {formatDate(listing.expiresAt)}
                                {days <= 7 && (
                                  <strong className="ml-1">
                                    ({days} day{days !== 1 ? "s" : ""} left)
                                  </strong>
                                )}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-2 border-t border-gray-100">
                          {/* Edit — always available unless sold */}
                          {status !== "sold" && (
                            <button
                              onClick={() => handleEdit(listing)}
                              disabled={busy}
                              className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-40"
                            >
                              <HiOutlinePencil className="w-4 h-4" />
                              Edit
                            </button>
                          )}

                          {/* Extend — for active & expired listings */}
                          {status !== "sold" && (
                            <button
                              onClick={() => handleExtend(listing)}
                              disabled={busy}
                              className="flex items-center gap-2 px-4 py-2.5 bg-green-50 hover:bg-green-100 text-green-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-40"
                            >
                              <HiOutlineRefresh className="w-4 h-4" />
                              {busy ? "Please wait…" : "Extend 30 Days"}
                            </button>
                          )}

                          {/* Mark as Sold */}
                          {status !== "sold" && (
                            <button
                              onClick={() => handleMarkSold(listing)}
                              disabled={busy}
                              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors disabled:opacity-40"
                            >
                              <HiOutlineCheckCircle className="w-4 h-4" />
                              Mark as Sold
                            </button>
                          )}

                          {/* Delete — always available */}
                          <button
                            onClick={() => handleDelete(listing)}
                            disabled={busy}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm rounded-xl transition-colors disabled:opacity-40 ml-auto"
                          >
                            <HiOutlineTrash className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* ── Add / Edit form ── */
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={handleFormCancel}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4 flex items-center gap-1"
              >
                ← Back to listings
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {view === "edit" ? "Edit Property" : "Add New Property"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {view === "edit"
                  ? "Update the details below and save your changes."
                  : "Fill in the details below. The listing will be active for 30 days."}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-6 sm:p-8">
              <AdminListingForm
                listing={editingListing}
                onSuccess={handleFormSuccess}
                onCancel={handleFormCancel}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
