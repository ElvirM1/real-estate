"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
} from "react-icons/hi";

export function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/#listings", label: t("nav.listings") },
    { href: "/contact", label: t("nav.contact") },
  ];

  return (
    <footer className="bg-slate-900 text-gray-400 mt-20">
      {/* Top divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* ── Brand ─────────────────────────────────── */}
          <div className="space-y-4">
            <Link
              href="/"
              className="inline-flex flex-col items-start group select-none"
            >
              <span className="font-serif text-[20px] font-bold tracking-[0.16em] text-white uppercase leading-none group-hover:text-gray-200 transition-colors">
                Adriatica
              </span>
              <div className="w-full h-px bg-gray-600 my-[6px]" />
              <span className="text-[7px] font-semibold tracking-[0.38em] text-gray-400 uppercase">
                &mdash;&thinsp;Real Estate&thinsp;&mdash;
              </span>
            </Link>
            <p
              className="text-sm text-gray-500 leading-relaxed max-w-[240px]"
              suppressHydrationWarning
            >
              {t("footer.description")}
            </p>
          </div>

          {/* ── Navigation ────────────────────────────── */}
          <div className="space-y-4">
            <h3
              className="text-xs font-semibold text-gray-300 uppercase tracking-widest"
              suppressHydrationWarning
            >
              {t("footer.navigation")}
            </h3>
            <ul className="space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Contact ───────────────────────────────── */}
          <div className="space-y-4">
            <h3
              className="text-xs font-semibold text-gray-300 uppercase tracking-widest"
              suppressHydrationWarning
            >
              {t("footer.contact")}
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href="mailto:dularame@gmail.com"
                  className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors duration-200"
                >
                  <HiOutlineMail className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  dularame@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+38345999921"
                  className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors duration-200"
                >
                  <HiOutlinePhone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  +383 45 999 921
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-500">
                <HiOutlineLocationMarker className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  Rr. Bill Clinton, nr.39
                  <br />
                  30000 Pejë, KS
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div
          className="mt-12 pt-6 border-t border-white/5 text-xs text-gray-600 text-center"
          suppressHydrationWarning
        >
          &copy; {year} Adriatica Real Estate &mdash; {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
}
