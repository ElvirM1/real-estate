"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AdminAccessModal } from "./admin/AdminAccessModal";

export function Navbar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [logoPulse, setLogoPulse] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const logoClicks = useRef<number[]>([]);

  const links = [
    { href: "/", label: t("nav.home") },
    { href: "/#listings", label: t("nav.listings") },
    { href: "/contact", label: t("nav.contact") },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return pathname === "/";
    return pathname === href;
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    const recent = logoClicks.current.filter((t) => now - t < 1500);

    recent.push(now);
    logoClicks.current = recent;

    if (recent.length >= 3) {
      e.preventDefault();
      logoClicks.current = [];
      setAdminOpen(true);
      setLogoPulse(false);
    } else if (recent.length === 2) {
      setLogoPulse(true);
      setTimeout(() => setLogoPulse(false), 400);
    }
  };

  // Transparent over hero, solid once scrolled (homepage only)
  const transparent = isHome && !scrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          transparent
            ? "bg-gradient-to-b from-black/30 to-transparent border-b border-transparent shadow-none"
            : "bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">
            {/* Brand — typographic lockup */}
            <Link
              href="/"
              onClick={handleLogoClick}
              className="flex flex-col items-center flex-shrink-0 group select-none"
              aria-label="Adriatica Real Estate — Home"
            >
              <div
                className={`flex flex-col items-center transition-transform duration-200 ${logoPulse ? "scale-[1.03]" : "scale-100"}`}
              >
                <span
                  className={`font-serif text-[20px] sm:text-[24px] font-bold tracking-[0.16em] uppercase leading-none transition-colors duration-300 ${
                    transparent
                      ? "text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]"
                      : "text-[#1a1a1a]"
                  }`}
                >
                  Adriatica
                </span>
                <div
                  className={`w-full h-px my-[6px] transition-colors duration-300 ${
                    transparent ? "bg-white/65" : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-[7px] sm:text-[8px] font-semibold tracking-[0.38em] uppercase transition-colors duration-300 ${
                    transparent
                      ? "text-white/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]"
                      : "text-gray-500"
                  }`}
                >
                  &mdash;&thinsp;Real Estate&thinsp;&mdash;
                </span>
              </div>
            </Link>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-1">
              {links.map((link) => {
                const active = isActive(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-300 ${
                      transparent
                        ? active
                          ? "text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]"
                          : "text-white/90 hover:text-white hover:bg-white/10 [text-shadow:0_1px_6px_rgba(0,0,0,0.4)]"
                        : active
                          ? "text-blue-600"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    <span suppressHydrationWarning>{link.label}</span>

                    {active && (
                      <span
                        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full transition-colors duration-300 ${
                          transparent ? "bg-white" : "bg-blue-600"
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAdminOpen(true)}
                className={`hidden md:inline-flex text-xs font-medium transition-colors duration-300 ${
                  transparent
                    ? "text-white/50 hover:text-white/80"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                Staff
              </button>

              <LanguageSwitcher />

              <button
                className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
                  transparent
                    ? "text-white hover:bg-white/10"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="menu"
              >
                {mobileOpen ? (
                  <HiX className="w-5 h-5" />
                ) : (
                  <HiOutlineMenu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
            {links.map((link) => {
              const active = isActive(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2.5 text-sm font-medium rounded-lg ${
                    active
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <span suppressHydrationWarning>{link.label}</span>
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileOpen(false);
                setAdminOpen(true);
              }}
              className="block w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:text-gray-600"
            >
              Staff
            </button>
          </div>
        )}
      </nav>

      {/* Admin modal */}
      <AdminAccessModal open={adminOpen} onClose={() => setAdminOpen(false)} />
    </>
  );
}
