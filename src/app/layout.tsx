import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "getAdPulse — Smart Link Tracking", template: "%s | getAdPulse" },
  description: "Transformez chaque clic en décision rentable avec getAdPulse : tracking de liens, analytics marketing, attribution et suivi des conversions.",
  applicationName: "getAdPulse",
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
