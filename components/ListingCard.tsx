"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HiLocationMarker, HiCurrencyEuro } from "react-icons/hi";
import { WhatsAppButton } from "./WhatsAppButton";
import { optimizeUrl, IMG_WIDTHS } from "@/lib/cloudinary";
import { formatPrice, isNegotiablePrice } from "@/lib/utils";
import type { Listing } from "@/types";

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const { t } = useTranslation();
  const primaryImage = listing.images?.[0] ?? null;

  return (
    <article className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] flex flex-col">
      {/* Image */}
      <Link
        href={`/listings/${listing.id}`}
        className="block relative aspect-[4/3] overflow-hidden bg-gray-100 flex-shrink-0"
      >
        {primaryImage ? (
          <Image
            src={optimizeUrl(primaryImage, IMG_WIDTHS.card)}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
            <HiCurrencyEuro className="w-16 h-16 text-blue-200" />
          </div>
        )}

        {/* Bottom gradient for readability */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

        {/* Image count badge */}
        {listing.images && listing.images.length > 1 && (
          <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-md backdrop-blur-sm">
            +{listing.images.length - 1}
          </span>
        )}

        {/* Sale / Rent / Negotiable badge — pill style */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm shadow-sm ${
            isNegotiablePrice(listing.price)
              ? "bg-emerald-600/90 text-white"
              : listing.type === "rent"
                ? "bg-violet-600/90 text-white"
                : "bg-blue-600/90 text-white"
          }`}
          suppressHydrationWarning
        >
          {isNegotiablePrice(listing.price)
            ? t("listings.badge.negotiable")
            : listing.type === "rent"
              ? t("listings.badge.rent")
              : t("listings.badge.sale")}
        </span>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Price */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <span
            className={`flex items-center gap-1 text-xl font-extrabold leading-tight ${
              isNegotiablePrice(listing.price)
                ? "text-emerald-600"
                : "text-blue-600"
            }`}
          >
            {!isNegotiablePrice(listing.price) && (
              <span className="text-base">💰</span>
            )}
            {formatPrice(listing.price)}
          </span>
          {listing.listingId && (
            <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0 mt-0.5">
              {listing.listingId}
            </span>
          )}
        </div>

        {/* Title */}
        <Link href={`/listings/${listing.id}`}>
          <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 hover:text-blue-600 transition-colors line-clamp-2">
            {listing.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4">
          <HiLocationMarker className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
          <Link
            href={`/listings/${listing.id}`}
            className="flex-1 text-center py-2.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-200"
          >
            <span suppressHydrationWarning>{t("listings.viewDetails")}</span>
          </Link>
          <WhatsAppButton listing={listing} compact />
        </div>
      </div>
    </article>
  );
}
