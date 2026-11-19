import type { Metadata } from "next";
import localFont from "next/font/local";
import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "./globals.css";

const onest = localFont({
  src: "./fonts/Onest.ttf",
  weight: "100 900",
  variable: "--font-onest",
  display: "swap",
});

const materialSymbols = localFont({
  src: "./fonts/material-symbols-rounded.woff2",
  variable: "--font-material-symbols",
  display: "block",
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "GTA VI Interaktivní mapa",
  description: "Česká interaktivní komunitní mapa Grand Theft Auto VI.",
  icons: {
    icon: { url: "/favicon/gta6-cz-map-favicon.svg", type: "image/svg+xml", sizes: "any" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="cs" className={`${onest.variable} ${materialSymbols.variable}`}>
      <body>{children}</body>
    </html>
  );
}
