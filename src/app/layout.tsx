import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AdPulse — Smart Link Tracking", template: "%s | AdPulse" },
  description: "Raccourcissez vos liens, mesurez vos campagnes et comprenez votre audience.",
  applicationName: "AdPulse",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f8fc",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
