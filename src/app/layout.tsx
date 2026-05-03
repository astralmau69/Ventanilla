import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

/* Cormorant Garamond — serif de lujo para display y titulares */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
});

/* Atkinson Hyperlegible — máxima legibilidad para UI y adultos mayores */
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Hospital — Sacado de Fichas",
  description: "Sistema de turnos táctil para kiosco hospitalario",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F2EDE3" },
    { media: "(prefers-color-scheme: dark)",  color: "#080F1D" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${cormorant.variable} ${atkinson.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
