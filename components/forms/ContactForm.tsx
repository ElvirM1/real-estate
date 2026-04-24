"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FiSend, FiCheck, FiLoader } from "react-icons/fi";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "38349210337";

const inputCls =
  "w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/15 focus:border-slate-400 transition-all duration-200";

const labelCls =
  "block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5";

type State = {
  emri: string;
  mbiemri: string;
  email: string;
  telefoni: string;
  mesazhi: string;
};

export function ContactForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<State>({
    emri: "",
    mbiemri: "",
    email: "",
    telefoni: "",
    mesazhi: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set =
    (k: keyof State) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    const lines = [
      `Përshëndetje, jam ${form.emri} ${form.mbiemri}.`,
      form.email ? `Email: ${form.email}` : null,
      `Telefoni: ${form.telefoni}`,
      `Mesazhi: ${form.mesazhi}`,
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

      {/* Email */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.email")}
        </label>
        <input
          type="email"
          className={inputCls}
          placeholder="artan@email.com"
          value={form.email}
          onChange={set("email")}
        />
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

      {/* Message */}
      <div>
        <label className={labelCls} suppressHydrationWarning>
          {t("contact.form.message")}
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={4}
          placeholder={t("contact.form.messagePlaceholder")}
          value={form.mesazhi}
          onChange={set("mesazhi")}
          required
          suppressHydrationWarning
        />
      </div>

      {/* Submit */}
      <SubmitButton status={status} t={t} />
    </form>
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
