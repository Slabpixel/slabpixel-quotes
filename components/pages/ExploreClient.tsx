"use client";

import { useState, useCallback, useRef } from "react";
import { type QuoteData } from "@/types/quote";
import QuoteCanvasGrid from "@/components/QuoteCanvasGrid";
import SiteHeader from "@/components/SiteHeader";
import Loader from "@/components/Loader";
import { BackToHome } from "@/components/BackToHome";
import { PLACEHOLDER_QUOTES_FEED } from "@/lib/placeholder-quotes";

interface ExploreClientProps {
  quotes: QuoteData[];
}

export default function ExploreClient({ quotes }: ExploreClientProps) {
  const [showLoader, setShowLoader] = useState(true);
  const entranceRef = useRef<(() => void) | null>(null);

  const displayQuotes = quotes.length > 0 ? quotes : PLACEHOLDER_QUOTES_FEED;

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
      <BackToHome />
      <QuoteCanvasGrid quotes={displayQuotes} onReady={handleSceneReady} />
    </>
  );
}
