"use client";

import { type QuoteData } from "@/types/quote";
import { useGoogleFont } from "@/lib/use-google-font";
import { getCardPaletteStyle, getPaletteForQuote } from "@/lib/quote-presets";
import { cn } from "@/lib/cn";
import SocialIcon from "./SocialIcon";

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
  onClick: (quote: QuoteData) => void;
}

export default function QuoteCard({ quote, index, onClick }: QuoteCardProps) {
  const palette = getPaletteForQuote(quote, index);
  const textColor = palette[2] || "#f0f0f0";

  // Dynamically load the quote's primary font
  useGoogleFont(quote.fontPrimary);

  return (
    <div
      className="quote-card bg-card-bg text-card-text"
      style={getCardPaletteStyle(quote, index)}
      onClick={() => onClick(quote)}
      data-quote-id={quote.id}
      data-mood={quote.mood || undefined}
    >
      {/* Subtle accent gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit]"
        style={{
          background: "radial-gradient(ellipse at bottom right, color-mix(in srgb, var(--card-accent) 8%, transparent) 0%, transparent 70%)",
        }}
      />

      {/* Mood-driven visual overlay (uses var(--accent) and var(--text) from parent) */}
      {quote.mood && (
        <div
          className={cn(
            "quote-card__mood-fx",
            `quote-card__mood-fx--${quote.mood}`,
          )}
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
        <span className="quote-card__attribution text-card-accent">
          {quote.attribution}
        </span>
        {quote.socialHandles?.length > 0 && (
          <SocialIcon
            handle={quote.socialHandles[0]}
            size={12}
            color={textColor}
            className="quote-card__handle"
          />
        )}
      </div>
    </div>
  );
}
