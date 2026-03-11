"use client";

import { type QuoteData } from "@/types/quote";
import { useGoogleFont } from "@/lib/use-google-font";
import { getPaletteForQuote } from "@/lib/quote-presets";
import { cn } from "@/lib/cn";
import SocialIcon from "./SocialIcon";

interface QuoteCardProps {
  quote: QuoteData;
  index: number;
  onClick: (quote: QuoteData) => void;
}

export default function QuoteCard({ quote, index, onClick }: QuoteCardProps) {
  const palette = getPaletteForQuote(quote, index);
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
          className={cn(
            "quote-card__mood-fx",
            `quote-card__mood-fx--${quote.mood}`,
          )}
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
