import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = "https://getadpulse.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AdPulse – Suivi de liens et analyse publicitaire",
    template: "%s | AdPulse",
  },
  description: "AdPulse vous aide à raccourcir et suivre vos liens, mesurer les clics et conversions, analyser vos campagnes publicitaires et mieux maîtriser vos dépenses marketing.",
  applicationName: "AdPulse",
  keywords: [
    "AdPulse",
    "tracking de liens",
    "suivi de liens",
    "analyse publicitaire",
    "analytics marketing",
    "suivi des clics",
    "performance des campagnes",
    "tracking publicitaire",
    "analyse des conversions",
  ],
  alternates: {
    canonical: "/",
    languages: { "fr": "/" },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "AdPulse",
    title: "AdPulse – Suivi de liens et analyse publicitaire",
    description: "Suivez vos liens, mesurez vos campagnes et comprenez vos performances marketing avec AdPulse.",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary",
    title: "AdPulse – Suivi de liens et analyse publicitaire",
    description: "Suivez vos liens, mesurez vos campagnes et comprenez vos performances marketing avec AdPulse.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
