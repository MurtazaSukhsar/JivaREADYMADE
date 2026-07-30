import type { Metadata } from "next";
import { Outfit, Inter, Space_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteConfig } from "@/lib/config";
import { CartProvider } from "@/contexts/CartContext";
import { getLanguage } from "@/lib/i18n-server";
import { LANGUAGE_COOKIE, isLanguage } from "@/lib/i18n";
import { cookies } from "next/headers";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSelectorModal from "@/components/LanguageSelectorModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.tagline,
};

export const viewport = {
  themeColor: "#1A0008",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Null when this visitor has never picked a language — that's what makes
  // the popup appear. Reading it here (not in the browser) means the first
  // HTML sent is already in the right language.
  const cookieValue = cookies().get(LANGUAGE_COOKIE)?.value;
  const chosen = isLanguage(cookieValue) ? cookieValue : null;

  return (
    <html lang={getLanguage()} className="dark">
      <body
        className={`${outfit.variable} ${inter.variable} ${spaceMono.variable} min-h-screen bg-night font-body text-cream antialiased`}
      >
        <LanguageProvider initial={chosen}>
          <LanguageSelectorModal />
          <CartProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </CartProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
