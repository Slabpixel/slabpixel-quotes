"use client";

import { useState, useCallback, useRef } from "react";
import { type QuoteData } from "@/types/quote";
import QuoteCanvasGrid from "@/components/QuoteCanvasGrid";
import SiteHeader from "@/components/SiteHeader";
import Loader from "@/components/Loader";

// Fallback quotes when the database has none
const PLACEHOLDER_QUOTES: QuoteData[] = [
  {
    id: "placeholder-1",
    text: "The best way to predict the future is to design it.",
    attribution: "Buckminster Fuller",
    socialHandle: null,
    authorPhoto: null,
    fontPrimary: "Playfair Display",
    fontSecondary: "Inter",
    colorPalette: JSON.stringify(["#1a1a2e", "#e94560", "#ffffff", "#999999"]),
    mood: "bold",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-2",
    text: "White space is to be regarded as an active element, not a passive background.",
    attribution: "Jan Tschichold",
    socialHandle: "@tschichold",
    authorPhoto: null,
    fontPrimary: "Cormorant Garamond",
    fontSecondary: "Source Sans Pro",
    colorPalette: JSON.stringify(["#2d2d2d", "#d4a574", "#f5f5dc", "#8b4513"]),
    mood: "serene",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-3",
    text: "Good design is as little design as possible.",
    attribution: "Dieter Rams",
    socialHandle: null,
    authorPhoto: null,
    fontPrimary: "Space Grotesk",
    fontSecondary: "DM Sans",
    colorPalette: JSON.stringify(["#0d1b2a", "#778da9", "#e0e1dd", "#415a77"]),
    mood: "minimal",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-4",
    text: "Design is thinking made visual.",
    attribution: "Saul Bass",
    socialHandle: "@saulbass",
    authorPhoto: null,
    fontPrimary: null,
    fontSecondary: null,
    colorPalette: JSON.stringify(["#1b1b2f", "#e43f5a", "#f0f0f0", "#162447"]),
    mood: "bold",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-5",
    text: "Every great design begins with an even better story.",
    attribution: "Lorinda Mamo",
    socialHandle: null,
    authorPhoto: null,
    fontPrimary: null,
    fontSecondary: null,
    colorPalette: JSON.stringify(["#0b0c10", "#66fcf1", "#c5c6c7", "#45a29e"]),
    mood: "serene",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-6",
    text: "A designer knows he has achieved perfection not when there is nothing left to add, but when there is nothing left to take away.",
    attribution: "Antoine de Saint-Exupéry",
    socialHandle: null,
    authorPhoto: null,
    fontPrimary: null,
    fontSecondary: null,
    colorPalette: JSON.stringify(["#1a1a1a", "#ff6b6b", "#fefefe", "#c44569"]),
    mood: "minimal",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-7",
    text: "Color is a power which directly influences the soul.",
    attribution: "Wassily Kandinsky",
    socialHandle: null,
    authorPhoto: null,
    fontPrimary: null,
    fontSecondary: null,
    colorPalette: JSON.stringify(["#16213e", "#0f3460", "#e94560", "#533483"]),
    mood: "bold",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
  {
    id: "placeholder-8",
    text: "Styles come and go. Good design is a language, not a style.",
    attribution: "Massimo Vignelli",
    socialHandle: "@vignelli",
    authorPhoto: null,
    fontPrimary: null,
    fontSecondary: null,
    colorPalette: JSON.stringify(["#2c003e", "#d72631", "#f5f5f5", "#a2d5c6"]),
    mood: "serene",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
  },
];

interface HomeClientProps {
  quotes: QuoteData[];
}

export default function HomeClient({ quotes }: HomeClientProps) {
  const [showLoader, setShowLoader] = useState(true);
  const entranceRef = useRef<(() => void) | null>(null);

  const displayQuotes = quotes.length > 0 ? quotes : PLACEHOLDER_QUOTES;

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  const handleLoaderFadeStart = useCallback(() => {
    // Fire entrance immediately when fade begins — no delay
    entranceRef.current?.();
  }, []);

  const handleSceneReady = useCallback(
    (controls: { playEntrance: () => void }) => {
      entranceRef.current = controls.playEntrance;
      // If loader already finished (e.g. fast load), play immediately
      if (!showLoader) {
        controls.playEntrance();
      }
    },
    [showLoader],
  );

  return (
    <>
      {showLoader && (
        <Loader
          onComplete={handleLoaderComplete}
          onFadeStart={handleLoaderFadeStart}
        />
      )}
      <SiteHeader />
      <QuoteCanvasGrid quotes={displayQuotes} onReady={handleSceneReady} />
    </>
  );
}
