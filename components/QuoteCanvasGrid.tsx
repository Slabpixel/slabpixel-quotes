"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { type QuoteData } from "@/types/quote";
import DetailOverlay from "./DetailOverlay";

interface QuoteCanvasGridProps {
  quotes: QuoteData[];
  /** Called once the scene is ready; returns a handle to trigger entrance */
  onReady?: (controls: { playEntrance: () => void }) => void;
}

export default function QuoteCanvasGrid({
  quotes,
  onReady,
}: QuoteCanvasGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<import("@/lib/webgl/quote-scene").QuoteScene | null>(
    null,
  );
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);

  const handleQuoteClick = useCallback(
    (index: number) => {
      if (index >= 0 && index < quotes.length) {
        setSelectedQuote(quotes[index]);
      }
    },
    [quotes],
  );

  const handleCloseOverlay = useCallback(() => {
    setSelectedQuote(null);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || quotes.length === 0) return;

    let scene: import("@/lib/webgl/quote-scene").QuoteScene | null = null;

    // Dynamic import to avoid SSR issues with Three.js
    import("@/lib/webgl/quote-scene").then(({ QuoteScene }) => {
      if (!canvasRef.current) return;

      scene = new QuoteScene({
        canvas: canvasRef.current,
        quotes,
        onQuoteClick: handleQuoteClick,
        deferEntrance: true,
      });
      sceneRef.current = scene;

      // Notify parent the scene is ready
      if (onReady) {
        onReady({ playEntrance: () => scene?.playEntrance() });
      }
    });

    return () => {
      if (scene) {
        scene.destroy();
        scene = null;
      }
      sceneRef.current = null;
    };
  }, [quotes, handleQuoteClick]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="quote-canvas"
        style={{
          position: "fixed",
          inset: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          touchAction: "none",
        }}
      />
      {/* Hint text */}
      <div
        className="canvas-hint"
        style={{
          position: "fixed",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(0,0,0,0.3)",
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          fontFamily: "var(--font-secondary), sans-serif",
          pointerEvents: "none",
          zIndex: 1,
          transition: "opacity 0.6s ease",
        }}
      >
        Drag to explore &middot; Scroll to dive
      </div>

      <DetailOverlay quote={selectedQuote} onClose={handleCloseOverlay} />
    </>
  );
}
