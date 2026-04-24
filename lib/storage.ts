// Images are uploaded to Cloudinary (free tier, no credit card required).
// Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
// in your .env.local file.

import imageCompression from "browser-image-compression";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8, // target ≤ 800 KB before upload
  maxWidthOrHeight: 1600, // enough for full-screen gallery; no upscaling
  useWebWorker: true,
  fileType: "image/webp", // output as WebP — ~30% smaller than JPG at same quality
};

/**
 * Compress a file client-side before uploading.
 * Falls back silently to the original file if compression fails.
 */
async function compressImage(file: File): Promise<File> {
  try {
    return await imageCompression(file, COMPRESSION_OPTIONS);
  } catch {
    // Compression failed (e.g. already-tiny PNG) — upload original
    return file;
  }
}

export async function uploadImage(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET in .env.local",
    );
  }

  const compressed = await compressImage(file);

  const formData = new FormData();
  formData.append("file", compressed);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", `listings/${folder}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(
      `Cloudinary upload failed: ${response.status} — ${JSON.stringify(err)}`,
    );
  }

  const data = await response.json();
  return data.secure_url as string;
}

export async function uploadImages(
  files: File[],
  folder: string,
): Promise<string[]> {
  return Promise.all(files.map((file) => uploadImage(file, folder)));
}

// Cloudinary deletion requires a server-side signed request.
// Images are kept in Cloudinary when a listing is deleted — acceptable
// for the free tier (25 GB storage).
export async function deleteImageByUrl(_url: string): Promise<void> {
  // no-op on client side
}
