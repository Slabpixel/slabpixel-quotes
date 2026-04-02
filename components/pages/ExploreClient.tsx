"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { type QuoteData } from "@/types/quote";
import QuoteCanvasGrid from "@/components/QuoteCanvasGrid";
import SiteHeader from "@/components/SiteHeader";
import Loader from "@/components/Loader";
import { BackToHome } from "@/components/BackToHome";

interface ExploreClientProps {
  quotes: QuoteData[];
}

export default function ExploreClient({ quotes }: ExploreClientProps) {
  const [showLoader, setShowLoader] = useState(() => quotes.length > 0);
  const entranceRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (quotes.length === 0) setShowLoader(false);
  }, [quotes.length]);

  const handleLoaderComplete = useCallback(() => {
    setShowLoader(false);
  }, []);

  const handleLoaderFadeStart = useCallback(() => {
    entranceRef.current?.();
  }, []);

  const handleSceneReady = useCallback(
    (controls: { playEntrance: () => void }) => {
      entranceRef.current = controls.playEntrance;
      if (!showLoader) {
        controls.playEntrance();
      }
    },
    [showLoader],
  );

  return (
    <>
      {showLoader && quotes.length > 0 && (
        <Loader
          onComplete={handleLoaderComplete}
          onFadeStart={handleLoaderFadeStart}
        />
      )}
      <SiteHeader />
      <BackToHome />
      {quotes.length === 0 ? (
        <div
          className="fixed inset-0 flex items-center justify-center z-[2] px-6 text-center"
          style={{ fontFamily: "var(--font-secondary), sans-serif" }}
        >
          <p className="text-sm text-foreground/50 max-w-sm">
            No published quotes to explore yet.
          </p>
        </div>
      ) : (
        <QuoteCanvasGrid quotes={quotes} onReady={handleSceneReady} />
      )}
    </>
  );
}
