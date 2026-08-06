import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { Header } from "@/components/Header";
import { CreateListingFab } from "@/components/CreateListingFab";
import { CompanionListingPrompt } from "@/components/CompanionListingPrompt";
import { Footer } from "@/components/Footer";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { JsonLd } from "@/components/JsonLd";
import { WebMcp } from "@/components/WebMcp";
import {
  buildDefaultMetadata,
  buildOrganizationJsonLd,
  buildWebSiteJsonLd,
} from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <GoogleAnalytics />
      </head>
      <body className="flex min-h-full flex-col bg-white text-gray-900">
        <Script src="/webmcp.js" strategy="afterInteractive" />
        <WebMcp />
        <JsonLd data={[buildWebSiteJsonLd(), buildOrganizationJsonLd()]} />
        <AuthProvider>
          <Header />
          <main className="flex w-full flex-1 flex-col">{children}</main>
          <Footer />
          <CreateListingFab />
          <CompanionListingPrompt />
        </AuthProvider>
      </body>
    </html>
  );
}
