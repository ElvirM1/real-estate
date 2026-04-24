"use client";

import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { HiUpload, HiX } from "react-icons/hi";
import { addListing, updateListing } from "@/lib/firestore";
import { uploadImages } from "@/lib/storage";
import type { Listing, ListingFormData, ListingFeatures } from "@/types";
import { LISTING_CATEGORIES } from "@/types";
import { v4 as uuidv4 } from "uuid";

interface AdminListingFormProps {
  listing?: Listing | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const EMPTY_FEATURES: ListingFeatures = {
  rooms: "",
  bathrooms: "",
  parking: "",
  orientation: "",
  heating: "",
  floor: "",
  area: "",
};

const EMPTY_FORM: ListingFormData = {
  title: "",
  price: "",
  type: "sale",
  location: "",
  description: "",
  images: [],
  features: EMPTY_FEATURES,
};

const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all text-sm";

const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

export function AdminListingForm({
  listing,
  onSuccess,
  onCancel,
}: AdminListingFormProps) {
  const { t } = useTranslation();
  const isEditing = !!listing;

  const [form, setForm] = useState<ListingFormData>(
    isEditing
      ? {
          title: listing!.title,
          price: listing!.price,
          type: listing!.type ?? "sale",
          category: listing!.category,
          location: listing!.location,
          description: listing!.description,
          images: listing!.images ?? [],
          features: listing!.features ?? EMPTY_FEATURES,
        }
      : EMPTY_FORM,
  );

  // Pricing mode: "fixed" = numeric price, "negotiable" = "Me marrëveshje"
  const [pricingMode, setPricingMode] = useState<"fixed" | "negotiable">(
    isEditing && listing!.price === "Me marrëveshje" ? "negotiable" : "fixed",
  );

  // Existing images (already uploaded) to keep
  const [existingImages, setExistingImages] = useState<string[]>(
    isEditing ? (listing!.images ?? []) : [],
  );
  // New files selected by the user
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync form images when existingImages/newFiles change
  useEffect(() => {
    setForm((f) => ({ ...f, images: existingImages }));
  }, [existingImages]);

  const handleField = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFeature = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      features: { ...prev.features, [name]: value },
    }));
  };

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const MAX_IMAGES = 5;
    const currentTotal = existingImages.length + newFiles.length;
    const remaining = MAX_IMAGES - currentTotal;
    if (remaining <= 0) return;
    const accepted = Array.from(files)
      .filter((f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024)
      .slice(0, remaining); // never exceed limit
    setNewFiles((prev) => [...prev, ...accepted]);
    accepted.forEach((file) => {
      const url = URL.createObjectURL(file);
      setNewPreviews((prev) => [...prev, url]);
    });
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeNewFile = (idx: number) => {
    URL.revokeObjectURL(newPreviews[idx]);
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
    setNewPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!form.title || !form.location) {
      setSubmitError("Title and location are required.");
      return;
    }
    if (pricingMode === "fixed" && !form.price) {
      setSubmitError("Price is required for fixed pricing mode.");
      return;
    }
    setSaving(true);
    try {
      const folder = isEditing ? listing!.id : uuidv4();
      let uploadedUrls: string[] = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadImages(newFiles, folder);
      }
      const allImages = [...existingImages, ...uploadedUrls];

      if (isEditing) {
        await updateListing(listing!.id, { ...form, images: allImages });
      } else {
        await addListing({ ...form, images: allImages });
      }
      toast.success(t("admin.saveSuccess"));
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Unknown error occurred.";
      console.error("[AdminListingForm] Submit failed:", err);
      // Surface permission errors clearly
      if (
        msg.includes("permission") ||
        msg.includes("unauthorized") ||
        msg.includes("403")
      ) {
        setSubmitError(
          "Permission denied. Make sure Firebase Storage and Firestore rules allow authenticated writes. Check the browser console for details.",
        );
      } else {
        setSubmitError(msg);
      }
      toast.error("Failed to save. See error above.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* ── Section: Basic Info ───────────────────────────────── */}
      <section className="space-y-4">
        <SectionLabel>Informacioni Bazë</SectionLabel>

        {/* Sale / Rent toggle */}
        <div>
          <label className={labelCls}>Lloji i Pronës *</label>
          <div className="flex gap-2">
            {(["sale", "rent"] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setForm((p) => ({ ...p, type: opt }))}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                  form.type === opt
                    ? opt === "sale"
                      ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                      : "bg-purple-600 border-purple-600 text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {opt === "sale" ? "🏷 Për Shitje" : "🔑 Për Qira"}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className={labelCls}>Kategoria e Pronës</label>
          <select
            name="category"
            value={form.category ?? ""}
            onChange={handleField}
            className={inputCls}
          >
            <option value="">— Zgjidh kategorinë —</option>
            {LISTING_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className={labelCls}>{t("admin.title")} *</label>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleField}
            required
            placeholder={t("admin.titlePlaceholder")}
            className={inputCls}
          />
        </div>

        {/* Pricing mode toggle */}
        <div>
          <label className={labelCls}>Mënyra e çmimit *</label>
          <div className="flex gap-2 mb-3">
            {(["fixed", "negotiable"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setPricingMode(mode);
                  setForm((p) => ({
                    ...p,
                    price: mode === "negotiable" ? "Me marrëveshje" : "",
                  }));
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                  pricingMode === mode
                    ? mode === "negotiable"
                      ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                      : "bg-blue-600 border-blue-600 text-white shadow-sm"
                    : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {mode === "fixed" ? "💰 Çmimi fiks" : "🤝 Me marrëveshje"}
              </button>
            ))}
          </div>
        </div>

        {/* Price + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>{t("admin.price")} *</label>
            {pricingMode === "negotiable" ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
                🤝 Me marrëveshje
              </div>
            ) : (
              <input
                name="price"
                type="text"
                value={form.price}
                onChange={handleField}
                required
                placeholder={t("admin.pricePlaceholder")}
                className={inputCls}
              />
            )}
          </div>
          <div>
            <label className={labelCls}>{t("admin.location")} *</label>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleField}
              required
              placeholder={t("admin.locationPlaceholder")}
              className={inputCls}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className={labelCls}>{t("admin.description")}</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleField}
            rows={4}
            placeholder={t("admin.descriptionPlaceholder")}
            className={`${inputCls} resize-none`}
          />
        </div>
      </section>

      {/* ── Section: Features ────────────────────────────────── */}
      <section className="space-y-4">
        <SectionLabel>Karakteristikat</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <FeatureInput
            name="rooms"
            label="Dhoma gjumi"
            placeholder="p.sh. 3"
            value={form.features?.rooms ?? ""}
            onChange={handleFeature}
          />
          <FeatureInput
            name="bathrooms"
            label="Banjo"
            placeholder="p.sh. 2"
            value={form.features?.bathrooms ?? ""}
            onChange={handleFeature}
          />
          <FeatureInput
            name="area"
            label="Sipërfaqja (m²)"
            placeholder="p.sh. 90"
            value={form.features?.area ?? ""}
            onChange={handleFeature}
          />
          <FeatureInput
            name="floor"
            label="Kati"
            placeholder="p.sh. 3/6"
            value={form.features?.floor ?? ""}
            onChange={handleFeature}
          />
          <FeatureInput
            name="parking"
            label="Parkingu"
            placeholder="Po / Jo"
            value={form.features?.parking ?? ""}
            onChange={handleFeature}
          />
          <FeatureInput
            name="heating"
            label="Ngrohja"
            placeholder="p.sh. Qendrore"
            value={form.features?.heating ?? ""}
            onChange={handleFeature}
          />
          <div className="col-span-2 sm:col-span-3">
            <FeatureInput
              name="orientation"
              label="Orientimi"
              placeholder="p.sh. Jug-Lindje"
              value={form.features?.orientation ?? ""}
              onChange={handleFeature}
            />
          </div>
        </div>
      </section>

      {/* ── Section: Images ───────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>
          {t("admin.uploadImages")}
          {" — "}
          <span
            className={
              existingImages.length + newFiles.length >= 5
                ? "text-orange-500"
                : "text-gray-400"
            }
          >
            {existingImages.length + newFiles.length}/5
          </span>
        </SectionLabel>

        {/* Drop zone — disabled when at limit */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (existingImages.length + newFiles.length < 5) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={
            existingImages.length + newFiles.length < 5 ? handleDrop : undefined
          }
          onClick={() =>
            existingImages.length + newFiles.length < 5 &&
            fileInputRef.current?.click()
          }
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
            existingImages.length + newFiles.length >= 5
              ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
              : dragOver
                ? "border-blue-400 bg-blue-50 cursor-pointer"
                : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer"
          }`}
        >
          <HiUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">
            {existingImages.length + newFiles.length >= 5
              ? "Limiti i imazheve u arrit (max 5)"
              : t("admin.uploadHint")}
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />

        {/* Existing images */}
        {existingImages.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              {t("admin.existingImages")}
            </p>
            <div className="flex flex-wrap gap-3">
              {existingImages.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-24 h-20 rounded-xl overflow-hidden border border-gray-200"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New file previews */}
        {newPreviews.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 mb-2">
              {t("admin.newImages")}
            </p>
            <div className="flex flex-wrap gap-3">
              {newPreviews.map((url, idx) => (
                <div
                  key={idx}
                  className="relative group w-24 h-20 rounded-xl overflow-hidden border border-blue-200"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewFile(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <HiX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Error ────────────────────────────────────────────── */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl leading-relaxed">
          <strong>Gabim:</strong> {submitError}
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed text-sm"
        >
          {saving
            ? t("admin.saving")
            : isEditing
              ? t("admin.save")
              : t("admin.add")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3.5 text-gray-600 border border-gray-200 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
        >
          {t("admin.cancel")}
        </button>
      </div>
    </form>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest pb-1 border-b border-gray-100">
      {children}
    </p>
  );
}

function FeatureInput({
  name,
  label,
  placeholder,
  value,
  onChange,
}: {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}
      </label>
      <input
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all text-sm"
      />
    </div>
  );
}
