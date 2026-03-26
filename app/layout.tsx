import type { Metadata } from "next";
import localFont from "next/font/local";
import "lenis/dist/lenis.css";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import LenisProvider from "@/components/LenisProvider";
import { AuthModalProvider } from "@/components/AuthModalProvider";

const switzer = localFont({
  src: "./Switzer-Variable.woff2",
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SlabPixel Quotes",
  description:
    "Design-first storytelling. Words transformed into visual artifacts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${switzer.variable} font-sans antialiased`}>
        <LenisProvider>
          <AuthModalProvider>
            <SiteHeader />
            {children}
          </AuthModalProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
