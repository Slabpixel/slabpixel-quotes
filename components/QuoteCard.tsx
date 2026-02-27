"use client";

import { type QuoteData } from "@/types/quote";
import { useGoogleFont } from "@/lib/use-google-font";
import SocialIcon from "./SocialIcon";

// Default palettes for quotes without custom colors
// Format: [bg, accent, text, muted] — all high-contrast
const DEFAULT_PALETTES = [
  ["#1a1a2e", "#e94560", "#f0f0f0", "#999999"],
  ["#0d1b2a", "#66d9ef", "#e0e1dd", "#415a77"],
  ["#2d2d2d", "#f5c842", "#f5f5f0", "#8b7a3a"],
  ["#1b1b2f", "#e43f5a", "#f0f0f0", "#7a7a9a"],
  ["#0b0c10", "#66fcf1", "#e8e8e8", "#45a29e"],
  ["#1a1a1a", "#ff6b6b", "#fefefe", "#c44569"],
  ["#16213e", "#a78bfa", "#eef0ff", "#533483"],
  ["#2c003e", "#d72631", "#f5f5f5", "#a2d5c6"],
];

function getPalette(quote: QuoteData, index: number): string[] {
  if (quote.colorPalette) {
    try {
      return JSON.parse(quote.colorPalette);
    } catch {
      // fall through
    }
  }
  return DEFAULT_PALETTES[index % DEFAULT_PALETTES.length];
}

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
  onClick: (quote: QuoteData) => void;
}

export default function QuoteCard({ quote, index, onClick }: QuoteCardProps) {
  const palette = getPalette(quote, index);
  const bgColor = palette[0] || "#1a1a2e";
  const textColor = palette[2] || "#ffffff";
  const accentColor = palette[1] || "#e94560";

  // Dynamically load the quote's primary font
  useGoogleFont(quote.fontPrimary);

  return (
    <div
      className="quote-card"
      style={
        {
          backgroundColor: bgColor,
          color: textColor,
          "--accent": accentColor,
        } as React.CSSProperties
      }
      onClick={() => onClick(quote)}
      data-quote-id={quote.id}
      data-mood={quote.mood || undefined}
    >
      {/* Subtle accent gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at bottom right, ${accentColor}15 0%, transparent 70%)`,
          pointerEvents: "none",
          borderRadius: "inherit",
        }}
      />

      {/* Mood-driven visual overlay */}
      {quote.mood && (
        <div
          className={`quote-card__mood-fx quote-card__mood-fx--${quote.mood}`}
          style={
            {
              "--accent": accentColor,
              "--text": textColor,
            } as React.CSSProperties
          }
        />
      )}

      <div style={{ position: "relative", zIndex: 1 }}>
        <p
          className="quote-card__text"
          style={
            quote.fontPrimary
              ? { fontFamily: `"${quote.fontPrimary}", serif` }
              : undefined
          }
        >
          &ldquo;{quote.text}&rdquo;
        </p>
      </div>

      <div
        className="quote-card__footer"
        style={{ position: "relative", zIndex: 1 }}
      >
        <span
          className="quote-card__attribution"
          style={{ color: accentColor }}
        >
          {quote.attribution}
        </span>
        {quote.socialHandle && (
          <SocialIcon
            handle={quote.socialHandle}
            size={12}
            color={textColor}
            className="quote-card__handle"
          />
        )}
      </div>
    </div>
  );
}
