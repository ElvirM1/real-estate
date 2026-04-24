"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HiArrowLeft, HiLocationMarker, HiCalendar } from "react-icons/hi";
import { Navbar } from "@/components/Navbar";
import { ImageGallery } from "@/components/ImageGallery";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Footer } from "@/components/Footer";
import { getListing } from "@/lib/firestore";
import { formatPrice, isNegotiablePrice, formatTimestamp } from "@/lib/utils";
import type { Listing } from "@/types";

export default function ListingDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListing(id)
      .then((data) => {
        if (!data) setNotFound(true);
        else setListing(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <>
      <Navbar />

      <main className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-8"
        >
          <HiArrowLeft className="w-4 h-4" />
          {t("listings.back")}
        </Link>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="aspect-video bg-gray-200 rounded-2xl" />
            <div className="h-8 bg-gray-200 rounded-xl w-2/3" />
            <div className="h-6 bg-gray-200 rounded-xl w-1/3" />
            <div className="h-32 bg-gray-200 rounded-xl w-full" />
          </div>
        ) : notFound || !listing ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">Property not found.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold text-sm rounded-xl hover:bg-blue-700 transition-colors"
            >
              {t("listings.back")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: Gallery */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2 leading-tight">
                {listing.title}
              </h1>

              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span
                  className={`text-2xl font-bold ${
                    isNegotiablePrice(listing.price)
                      ? "text-emerald-600"
                      : "text-blue-600"
                  }`}
                >
                  {formatPrice(listing.price)}
                </span>
                {/* Sale / Rent / Negotiable badge */}
                {listing.type && (
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      isNegotiablePrice(listing.price)
                        ? "bg-emerald-100 text-emerald-700"
                        : listing.type === "rent"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <span suppressHydrationWarning>
                      {isNegotiablePrice(listing.price)
                        ? t("listings.badge.negotiable")
                        : listing.type === "rent"
                          ? t("listings.badge.forRent")
                          : t("listings.badge.forSale")}
                    </span>
                  </span>
                )}
                {/* Listing ID */}
                {listing.listingId && (
                  <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                    {listing.listingId}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-sm text-gray-500">
                  <HiLocationMarker className="w-4 h-4 text-blue-400" />
                  {listing.location}
                </span>
                {listing.createdAt && (
                  <span className="flex items-center gap-1.5 text-sm text-gray-400">
                    <HiCalendar className="w-4 h-4" />
                    {t("listings.postedOn")}{" "}
                    {formatTimestamp(listing.createdAt)}
                  </span>
                )}
              </div>

              {/* Gallery */}
              {listing.images && listing.images.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {t("listings.gallery")}
                  </h2>
                  <ImageGallery images={listing.images} title={listing.title} />
                </div>
              )}

              {/* Description */}
              {listing.description && (
                <div>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {t("listings.description")}
                  </h2>
                  <div className="bg-white rounded-2xl shadow-card p-6">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {listing.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Features grid */}
              {listing.features &&
                Object.values(listing.features).some(Boolean) && (
                  <div className="mt-8">
                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Karakteristikat
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        {
                          key: "area",
                          label: "Sipërfaqja",
                          suffix: " m²",
                          icon: "📐",
                        },
                        {
                          key: "rooms",
                          label: "Dhoma gjumi",
                          suffix: "",
                          icon: "🛏",
                        },
                        {
                          key: "bathrooms",
                          label: "Banjo",
                          suffix: "",
                          icon: "🛁",
                        },
                        { key: "floor", label: "Kati", suffix: "", icon: "🏢" },
                        {
                          key: "parking",
                          label: "Parkingu",
                          suffix: "",
                          icon: "🚗",
                        },
                        {
                          key: "heating",
                          label: "Ngrohja",
                          suffix: "",
                          icon: "🔥",
                        },
                        {
                          key: "orientation",
                          label: "Orientimi",
                          suffix: "",
                          icon: "🧭",
                        },
                      ].map(({ key, label, suffix, icon }) => {
                        const val =
                          listing.features?.[
                            key as keyof typeof listing.features
                          ];
                        if (!val) return null;
                        return (
                          <div
                            key={key}
                            className="bg-white rounded-xl shadow-card p-4 flex flex-col gap-2"
                          >
                            <span className="text-xl">{icon}</span>
                            <div>
                              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide block mb-0.5">
                                {label}
                              </span>
                              <span className="text-base font-semibold text-gray-900">
                                {val}
                                {suffix}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* Right: Key Info + Contact */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24 space-y-5">
                {/* Price */}
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    {t("listings.price")}
                  </p>
                  <p
                    className={`text-2xl font-extrabold ${
                      isNegotiablePrice(listing.price)
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }`}
                  >
                    {formatPrice(listing.price)}
                  </p>
                </div>

                {/* Type badge */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-3 py-1.5 rounded-full ${
                      isNegotiablePrice(listing.price)
                        ? "bg-emerald-100 text-emerald-700"
                        : listing.type === "rent"
                          ? "bg-violet-100 text-violet-700"
                          : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {isNegotiablePrice(listing.price)
                      ? "🤝 Me marrëveshje"
                      : listing.type === "rent"
                        ? "🔑 Për Qira"
                        : "🏷 Për Shitje"}
                  </span>
                </div>

                {/* Key details */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-center gap-2.5 text-sm text-gray-700">
                    <span className="text-base">📍</span>
                    <span className="font-medium">{listing.location}</span>
                  </div>
                  {listing.features?.area && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="text-base">📐</span>
                      <span className="font-medium">
                        {listing.features.area} m²
                      </span>
                    </div>
                  )}
                  {listing.features?.rooms && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="text-base">🛏</span>
                      <span className="font-medium">
                        {listing.features.rooms} dhoma
                      </span>
                    </div>
                  )}
                  {listing.features?.bathrooms && (
                    <div className="flex items-center gap-2.5 text-sm text-gray-700">
                      <span className="text-base">🛁</span>
                      <span className="font-medium">
                        {listing.features.bathrooms} banjo
                      </span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100" />

                {/* WhatsApp CTA */}
                <div>
                  <p className="text-xs text-gray-400 mb-3">
                    {t("listings.contactWhatsApp")}
                  </p>
                  <WhatsAppButton listing={listing} />
                </div>

                {/* Reassurance note */}
                <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl border border-green-100 text-center">
                  💬 Mesazhi plotësohet automatikisht me detajet e pronës.
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
