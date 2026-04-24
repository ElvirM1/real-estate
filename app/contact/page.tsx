"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PropertyRequestForm } from "@/components/forms/PropertyRequestForm";
import { PropertyOfferForm } from "@/components/forms/PropertyOfferForm";
import { ContactForm } from "@/components/forms/ContactForm";

type TabId = "kerko" | "ofro" | "kontakt";

export default function ContactPage() {
  const { t } = useTranslation();
  const [activeId, setActiveId] = useState<TabId>("kerko");

  const TABS: {
    id: TabId;
    label: string;
    description: string;
    dot: string;
  }[] = [
    {
      id: "kerko",
      label: t("contact.tabs.search"),
      description: t("contact.tabs.searchDesc"),
      dot: "bg-blue-500",
    },
    {
      id: "ofro",
      label: t("contact.tabs.offer"),
      description: t("contact.tabs.offerDesc"),
      dot: "bg-purple-500",
    },
    {
      id: "kontakt",
      label: t("contact.tabs.contact"),
      description: t("contact.tabs.contactDesc"),
      dot: "bg-slate-400",
    },
  ];

  const active = TABS.find((tab) => tab.id === activeId)!;

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f8fafc] pt-28 pb-24 px-4">
        <div className="max-w-[600px] mx-auto">
          {/* Page header */}
          <div className="text-center mb-10">
            <p
              className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3"
              suppressHydrationWarning
            >
              {t("contact.pageTeam")}
            </p>
            <h1
              className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3"
              suppressHydrationWarning
            >
              {t("contact.pageTitle")}
            </h1>
            <p
              className="text-gray-500 text-base max-w-sm mx-auto leading-relaxed"
              suppressHydrationWarning
            >
              {t("contact.pageSubtitle")}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1.5 bg-gray-100/80 p-1.5 rounded-2xl mb-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveId(tab.id)}
                className={`flex-1 py-2.5 px-3 text-[13px] font-medium rounded-xl transition-all duration-200 ${
                  activeId === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                }`}
                suppressHydrationWarning
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <div className="bg-white rounded-3xl shadow-[0_2px_24px_rgba(0,0,0,0.06)] p-7 sm:p-10">
            {/* Card heading */}
            <div className="flex items-start gap-3 mb-8">
              <span
                className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${active.dot}`}
              />
              <div>
                <h2
                  className="text-lg font-semibold text-gray-900 leading-snug"
                  suppressHydrationWarning
                >
                  {active.label}
                </h2>
                <p
                  className="text-sm text-gray-400 mt-0.5 leading-relaxed"
                  suppressHydrationWarning
                >
                  {active.description}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 mb-8" />

            {/* Form */}
            {activeId === "kerko" && <PropertyRequestForm />}
            {activeId === "ofro" && <PropertyOfferForm />}
            {activeId === "kontakt" && <ContactForm />}
          </div>

          {/* Bottom trust note */}
          <p
            className="text-center text-xs text-gray-400 mt-6 leading-relaxed"
            suppressHydrationWarning
          >
            {t("contact.trustNote")}
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}
