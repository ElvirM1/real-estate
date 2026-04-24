"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { HiChevronDown, HiGlobeAlt } from "react-icons/hi";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "sq", label: "Shqip", flag: "🇦🇱" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "sr", label: "Srpski", flag: "🇷🇸" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) ?? LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-xl transition-colors"
        aria-label="Change language"
      >
        <HiGlobeAlt className="w-4 h-4" />
        <span className="hidden sm:inline" suppressHydrationWarning>
          {current.flag} {current.label}
        </span>
        <span className="sm:hidden" suppressHydrationWarning>
          {current.flag}
        </span>
        <HiChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-1.5 z-50 animate-fade-in">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-blue-50 hover:text-blue-600 ${
                i18n.language === lang.code
                  ? "text-blue-600 font-semibold bg-blue-50"
                  : "text-gray-700"
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
