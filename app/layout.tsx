import type { Metadata } from "next";
import localFont from "next/font/local";
import { ViewTransitions } from "next-view-transitions";
import "lenis/dist/lenis.css";
import { Suspense } from "react";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import LenisProvider from "@/components/LenisProvider";
import { AuthModalProvider } from "@/components/AuthModalProvider";
import { SubmitQuoteModalProvider } from "@/components/SubmitQuoteModalProvider";
import ViewTransitionNavigator from "@/components/ViewTransitionNavigator";

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
    <ViewTransitions>
      <html lang="en">
        <body className={`${switzer.variable} font-sans antialiased`}>
          <LenisProvider>
            <AuthModalProvider>
              <Suspense fallback={null}>
                <SubmitQuoteModalProvider>
                  <ViewTransitionNavigator />
                  <SiteHeader />
                  {children}
                </SubmitQuoteModalProvider>
              </Suspense>
            </AuthModalProvider>
          </LenisProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
