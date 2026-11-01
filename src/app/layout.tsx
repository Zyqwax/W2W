import "./globals.css";
import { Inter, Syne } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter-family",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
  variable: "--font-syne-family",
});

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://seyir.app");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "W2W — What to Watch",
    template: "%s | W2W",
  },
  description: "İzlediğiniz ve izleyeceğiniz filmleri takip edin, listeler oluşturun ve arkadaşlarınızla film önerileri paylaşın.",
  applicationName: "W2W",
  keywords: [
    "film takip",
    "film listesi",
    "izleme listesi",
    "film önerisi",
    "sinema",
    "movie tracker",
    "watchlist",
    "W2W",
  ],
  authors: [{ name: "W2W" }],
  creator: "W2W",
  publisher: "W2W",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "W2W — What to Watch",
    description: "İzlediğiniz ve izleyeceğiniz filmleri takip edin, listeler oluşturun ve arkadaşlarınızla film önerileri paylaşın.",
    url: siteUrl,
    siteName: "W2W",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "W2W — What to Watch",
    description: "İzlediğiniz ve izleyeceğiniz filmleri takip edin, listeler oluşturun ve arkadaşlarınızla film önerileri paylaşın.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "W2W",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import BottomNav from "@/components/BottomNav";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { AuthProvider } from "@/context/AuthContext";
import { AppDataProvider } from "@/context/AppDataContext";
import MainContentWrapper from "@/components/MainContentWrapper";
import LanguageSync from "@/components/LanguageSync";
import { NavigationProvider } from "@/context/NavigationContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`h-full antialiased ${inter.variable} ${syne.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[--color-bg] text-[--color-text] font-inter antialiased">
        <ServiceWorkerRegister />
        <AuthProvider>
          <LanguageSync />
          <AppDataProvider>
            <NavigationProvider>
              <BottomNav />
              <MainContentWrapper>{children}</MainContentWrapper>
            </NavigationProvider>
          </AppDataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
