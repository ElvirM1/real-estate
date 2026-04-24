import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kontakti",
  description:
    "Na kontaktoni për çdo pyetje rreth pronave. Adriatica Real Estate — Pejë, Kosovë.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
