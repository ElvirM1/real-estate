"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { optimizeUrl, IMG_WIDTHS } from "@/lib/cloudinary";
import { HiChevronLeft, HiChevronRight, HiX } from "react-icons/hi";
import { HiMagnifyingGlassPlus } from "react-icons/hi2";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prev = useCallback(
    () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1)),
    [images.length],
  );

  useEffect(() => {
    if (!zoomed) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoomed(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [zoomed, prev, next]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent, inModal = false) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) delta < 0 ? next() : prev();
    touchStartX.current = null;
    if (!inModal) e.stopPropagation();
  };

  if (!images || images.length === 0) {
    return (
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-slate-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-400 text-sm">No images available</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image — click to zoom */}
        <div
          className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 shadow-card cursor-zoom-in group"
          onClick={() => setZoomed(true)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e)}
        >
          <Image
            key={activeIndex}
            src={optimizeUrl(images[activeIndex], IMG_WIDTHS.full)}
            alt={`${title} - image ${activeIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, 70vw"
            className="object-cover animate-fade-in group-hover:scale-[1.02] transition-transform duration-500"
            priority={activeIndex === 0}
          />

          {/* Zoom hint overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40 text-white p-2.5 rounded-xl backdrop-blur-sm">
              <HiMagnifyingGlassPlus className="w-5 h-5" />
            </div>
          </div>

          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="Previous image"
              >
                <HiChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="Next image"
              >
                <HiChevronRight className="w-6 h-6" />
              </button>

              {/* Counter */}
              <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  idx === activeIndex
                    ? "border-blue-500 shadow-md scale-105"
                    : "border-transparent hover:border-blue-300 opacity-70 hover:opacity-100"
                }`}
              >
                <Image
                  src={optimizeUrl(img, IMG_WIDTHS.thumb)}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Zoom Modal ──────────────────────────────────────────────────── */}
      {zoomed && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in"
          onClick={() => setZoomed(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={(e) => handleTouchEnd(e, true)}
        >
          {/* Close button */}
          <button
            onClick={() => setZoomed(false)}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center justify-center backdrop-blur-sm transition-colors"
            aria-label="Close"
          >
            <HiX className="w-5 h-5" />
          </button>

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-sm font-medium px-3 py-1.5 rounded-lg backdrop-blur-sm">
              {activeIndex + 1} / {images.length}
            </div>
          )}

          {/* Full image */}
          <div
            className="relative w-full h-full max-w-6xl mx-6 my-20"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={optimizeUrl(images[activeIndex], IMG_WIDTHS.full)}
              alt={`${title} - image ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain animate-fade-in"
              priority
            />
          </div>

          {/* Nav arrows in modal */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="Previous"
              >
                <HiChevronLeft className="w-7 h-7" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center backdrop-blur-sm transition-colors"
                aria-label="Next"
              >
                <HiChevronRight className="w-7 h-7" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
