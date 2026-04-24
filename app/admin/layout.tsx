"use client";

import { useEffect } from "react";
import i18n from "@/i18n/config";

/**
 * Forces the admin panel to always display in Albanian (sq),
 * regardless of the user's selected language.
 * Language is restored when navigating away from /admin.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const previous = i18n.language;
    i18n.changeLanguage("sq");
    return () => {
      // Restore the user's language when they leave the admin area
      i18n.changeLanguage(previous);
    };
  }, []);

  return <>{children}</>;
}
