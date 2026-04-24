"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSend, FiCheck, FiLoader } from "react-icons/fi";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "38349210337";

const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all duration-200";

const selectCls =
  "w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-400 transition-all duration-200 appearance-none cursor-pointer";

const labelCls =
  "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

type State = {
  emri: string;
  mbiemri: string;
  telefoni: string;
  lloji: string;
  kategoria: string;
  lokacioni: string;
  buxheti: string;
  sipMin: string;
  sipMax: string;
  detaje: string;
};

export function PropertyRequestForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<State>({
    emri: "",
    mbiemri: "",
    telefoni: "",
    lloji: "",
    kategoria: "",
    lokacioni: "",
    buxheti: "",
    sipMin: "",
    sipMax: "",
    detaje: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const LLOJET = [t("contact.typeOptions.buy"), t("contact.typeOptions.rent")];
  const KATEGORITE = [
    t("contact.categories.house"),
    t("contact.categories.apartment"),
    t("contact.categories.office"),
    t("contact.categories.shop"),
    t("contact.categories.land"),
    t("contact.categories.warehouse"),
    t("contact.categories.building"),
  ];

  const set =
    (k: keyof State) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const lines = [
      `Përshëndetje, jam ${form.emri} ${form.mbiemri}.`,
      `Po kërkoj një pronë:`,
      `• Lloji: ${form.lloji}`,
      `• Kategoria: ${form.kategoria}`,
      `• Lokacioni: ${form.lokacioni}`,
      `• Buxheti: ${form.buxheti}`,
      form.sipMin || form.sipMax
        ? `• Sipërfaqja: ${form.sipMin || "—"}m² - ${form.sipMax || "—"}m²`
        : null,
      form.detaje ? `• Detaje: ${form.detaje}` : null,
      `• Tel: ${form.telefoni}`,
    ]
      .filter(Boolean)
      .join("\n");

    await new Promise((r) => setTimeout(r, 900));

    window.open(
      `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines)}`,
      "_blank",
    );

    setStatus("sent");
    setTimeout(() => setStatus("idle"), 3500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} suppressHydrationWarning>
            {t("contact.form.firstName")}
          </label>
          <input
            className={inputCls}
            placeholder={t("contact.form.firstNamePlaceholder")}
            value={form.emri}
            onChange={set("emri")}
            required
            suppressHydrationWarning
          />
        </div>
        <div>
          <label className={labelCls} suppressHydrationWarning>
            {t("contact.form.lastName")}
          </label>
          <input
            className={inputCls}
            placeholder={t("contact.form.lastNamePlaceholder")}
            value={form.mbiemri}
            onChange={set("mbiemri")}
            required
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.phone")}
        </label>
        <input
          type="tel"
          className={inputCls}
          placeholder={t("contact.form.phonePlaceholder")}
          value={form.telefoni}
          onChange={set("telefoni")}
          required
          suppressHydrationWarning
        />
      </div>

      {/* Type / Category */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls} suppressHydrationWarning>
            {t("contact.form.type")}
          </label>
          <div className="relative">
            <select
              className={selectCls}
              value={form.lloji}
              onChange={set("lloji")}
              required
              suppressHydrationWarning
            >
              <option value="" suppressHydrationWarning>
                {t("contact.form.choose")}
              </option>
              {LLOJET.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
        <div>
          <label className={labelCls} suppressHydrationWarning>
            {t("contact.form.category")}
          </label>
          <div className="relative">
            <select
              className={selectCls}
              value={form.kategoria}
              onChange={set("kategoria")}
              required
              suppressHydrationWarning
            >
              <option value="" suppressHydrationWarning>
                {t("contact.form.choose")}
              </option>
              {KATEGORITE.map((k) => (
                <option key={k}>{k}</option>
              ))}
            </select>
            <ChevronDown />
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.location")}
        </label>
        <input
          className={inputCls}
          placeholder={t("contact.form.locationPlaceholderCenter")}
          value={form.lokacioni}
          onChange={set("lokacioni")}
          required
          suppressHydrationWarning
        />
      </div>

      {/* Budget */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.budget")}
        </label>
        <input
          className={inputCls}
          placeholder={t("contact.form.budgetPlaceholder")}
          value={form.buxheti}
          onChange={set("buxheti")}
          required
          suppressHydrationWarning
        />
      </div>

      {/* Area */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.area")}
        </label>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder={t("contact.form.areaMin")}
            value={form.sipMin}
            onChange={set("sipMin")}
            suppressHydrationWarning
          />
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder={t("contact.form.areaMax")}
            value={form.sipMax}
            onChange={set("sipMax")}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Additional details */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.additionalDetails")}
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder={t("contact.form.detailsPlaceholder")}
          value={form.detaje}
          onChange={set("detaje")}
          suppressHydrationWarning
        />
      </div>

      {/* Submit */}
      <SubmitButton status={status} t={t} />
    </form>
  );
}

function ChevronDown() {
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 5l4 4 4-4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function SubmitButton({
  status,
  t,
}: {
  status: "idle" | "sending" | "sent";
  t: (key: string) => string;
}) {
  return (
    <div className="pt-2">
      <button
        type="submit"
        disabled={status !== "idle"}
        className={`w-full py-4 rounded-2xl font-semibold text-white text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2.5 disabled:cursor-not-allowed ${
          status === "sent"
            ? "bg-emerald-500"
            : "bg-[#25D366] hover:bg-[#20c45e] hover:shadow-[0_4px_24px_rgba(37,211,102,0.35)] active:scale-[0.98]"
        }`}
      >
        {status === "idle" && (
          <>
            <FiSend className="w-4 h-4" />
            <span suppressHydrationWarning>{t("contact.form.send")}</span>
          </>
        )}
        {status === "sending" && (
          <>
            <FiLoader className="w-4 h-4 animate-spin" />
            <span suppressHydrationWarning>{t("contact.form.sending")}</span>
          </>
        )}
        {status === "sent" && (
          <>
            <FiCheck className="w-4 h-4" />
            <span suppressHydrationWarning>{t("contact.form.sent")}</span>
          </>
        )}
      </button>
      <p
        className="text-center text-xs text-gray-400 mt-2.5"
        suppressHydrationWarning
      >
        {t("contact.form.sendHint")}
      </p>
    </div>
  );
}
