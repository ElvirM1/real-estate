"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { HiArrowDown, HiSparkles, HiPhone } from "react-icons/hi";
import { useCountAnimation } from "@/hooks/useCountAnimation";

interface HeroSectionProps {
  listingCount?: number;
}

export function HeroSection({ listingCount = 0 }: HeroSectionProps) {
  const { t } = useTranslation();
  const { count, ref: counterRef } = useCountAnimation(listingCount);
  const { count: langCount, ref: langRef } = useCountAnimation(4, 900);

  const scrollToListings = () => {
    document.getElementById("listings")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/Home-Image.png"
        alt="Premium real estate hero"
        fill
        priority
        quality={90}
        className="object-cover object-[50%_20%] sm:object-center"
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/35 to-black/75" />

      {/* Content — stagger via animation-delay */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center pt-20 sm:pt-0">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm tracking-wide uppercase animate-fade-in">
          <HiSparkles className="w-3.5 h-3.5 text-blue-300" />
          <span suppressHydrationWarning>{t("hero.badge")}</span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg animate-slide-up [animation-delay:100ms] [animation-fill-mode:both]"
          suppressHydrationWarning
        >
          {t("hero.title").split(" ").slice(0, 3).join(" ")}{" "}
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300"
            suppressHydrationWarning
          >
            {t("hero.title").split(" ").slice(3).join(" ")}
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-base sm:text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-10 drop-shadow animate-slide-up [animation-delay:200ms] [animation-fill-mode:both]"
          suppressHydrationWarning
        >
          {t("hero.subtitle")}
        </p>

        {/* Dual CTAs */}
        <div className="flex flex-wrap justify-center gap-3 animate-slide-up [animation-delay:300ms] [animation-fill-mode:both]">
          <button
            onClick={scrollToListings}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.04] hover:shadow-[0_0_48px_rgba(59,130,246,0.55)] active:scale-95 shadow-lg"
          >
            <span suppressHydrationWarning>{t("hero.cta")}</span>
            <HiArrowDown className="w-4 h-4 animate-bounce" />
          </button>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-base px-8 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.04] active:scale-95 backdrop-blur-sm"
          >
            <HiPhone className="w-4 h-4" />
            <span suppressHydrationWarning>{t("hero.cta2")}</span>
          </Link>
        </div>

        {/* Stats */}
        <div
          ref={counterRef}
          className="mt-20 flex flex-wrap justify-center gap-10 sm:gap-16 text-center animate-slide-up [animation-delay:400ms] [animation-fill-mode:both]"
        >
          {/* Dynamic listings count */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl mb-0.5">🏠</span>
            <span className="text-3xl font-bold text-white drop-shadow tabular-nums">
              {listingCount > 0 ? count : "—"}
            </span>
            <span
              className="text-xs text-white/55 uppercase tracking-wider"
              suppressHydrationWarning
            >
              {t("hero.statListings")}
            </span>
          </div>

          {/* Languages — animated 0 → 4 */}
          <div ref={langRef} className="flex flex-col items-center gap-2">
            <span className="text-2xl mb-0.5">🌍</span>
            <span className="text-3xl font-bold text-white drop-shadow tabular-nums">
              {langCount}
            </span>
            <span
              className="text-xs text-white/55 uppercase tracking-wider"
              suppressHydrationWarning
            >
              {t("hero.statLanguages")}
            </span>
          </div>

          {/* WhatsApp support */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-2xl mb-0.5">💬</span>
            <span className="text-3xl font-bold text-white drop-shadow">
              24/7
            </span>
            <span
              className="text-xs text-white/55 uppercase tracking-wider"
              suppressHydrationWarning
            >
              {t("hero.statSupport")}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <div className="w-px h-10 bg-gradient-to-b from-transparent to-white/30" />
        <HiArrowDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
}
