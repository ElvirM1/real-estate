import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/components/I18nProvider";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Adriatica Real Estate",
    template: "%s | Adriatica Real Estate",
  },
  description:
    "Zbuloni pronat premium në Kosovë dhe rajon. Shtëpi, banesa dhe lokale për shitje dhe qira — Adriatica Real Estate.",
  keywords: "prona, patundshmëri, shitje, qira, banesë, shtëpi, Pejë, Kosovë, real estate",
  openGraph: {
    title: "Adriatica Real Estate",
    description: "Zbuloni pronat premium — Adriatica Real Estate.",
    type: "website",
    siteName: "Adriatica Real Estate",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <I18nProvider>
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontFamily: "Inter, system-ui, sans-serif",
                },
              }}
            />
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
