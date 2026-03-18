"use client";

import { type QuoteData } from "@/types/quote";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGoogleFont } from "@/lib/use-google-font";
import { getCardPaletteStyle } from "@/lib/quote-presets";
import SocialIcon from "./SocialIcon";

interface DetailOverlayProps {
  quote: QuoteData | null;
  onClose: () => void;
}

export default function DetailOverlay({ quote, onClose }: DetailOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    if (!overlayRef.current || !backdropRef.current) return;

    if (quote) {
      isAnimating.current = true;
      backdropRef.current.classList.add("active");

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
        },
      });

      tl.to(backdropRef.current, {
        opacity: 1,
        duration: 0.6,
        ease: "power3.inOut",
      });

      tl.to(
        overlayRef.current,
        {
          x: 0,
          duration: 0.8,
          ease: "power3.inOut",
        },
        "<0.1",
      );

      // Animate content elements
      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll("[data-reveal]");
        tl.fromTo(
          elements,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.08,
          },
          "-=0.4",
        );
      }
    } else {
      isAnimating.current = true;

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimating.current = false;
          if (backdropRef.current) {
            backdropRef.current.classList.remove("active");
          }
        },
      });

      if (contentRef.current) {
        const elements = contentRef.current.querySelectorAll("[data-reveal]");
        tl.to(elements, {
          y: -20,
          opacity: 0,
          duration: 0.3,
          ease: "power3.in",
          stagger: 0.03,
        });
      }

      tl.to(
        overlayRef.current,
        {
          x: "100%",
          duration: 0.7,
          ease: "power3.inOut",
        },
        "-=0.1",
      );

      tl.to(
        backdropRef.current,
        {
          opacity: 0,
          duration: 0.5,
          ease: "power3.inOut",
        },
        "<0.1",
      );
    }
  }, [quote]);

  // Card palette (light defaults when quote is null or has no palette)
  const paletteStyle = getCardPaletteStyle(quote ?? { colorPalette: null }, 0);

  // Load the font for the detail view
  useGoogleFont(quote?.fontPrimary);

  return (
    <>
      <div
        ref={backdropRef}
        className="detail-overlay__backdrop"
        onClick={onClose}
      />
      <div
        ref={overlayRef}
        className="detail-overlay bg-card-bg text-card-text"
        style={paletteStyle}
        data-mood={quote?.mood || undefined}
      >
        <button
          className="detail-overlay__close text-card-text"
          onClick={onClose}
        >
          &#x2715;
        </button>

        <div ref={contentRef}>
          <p
            className="detail-overlay__quote"
            data-reveal
            style={
              quote?.fontPrimary
                ? { fontFamily: `"${quote.fontPrimary}", serif` }
                : undefined
            }
          >
            &ldquo;{quote?.text}&rdquo;
          </p>

          <div className="detail-overlay__meta">
            <span className="detail-overlay__attribution text-card-accent" data-reveal>
              {quote?.attribution}
            </span>
            {quote?.socialHandles?.map((handle, i) => (
              <SocialIcon
                key={i}
                handle={handle}
                size={16}
                color="var(--card-text)"
                className="detail-overlay__handle"
              />
            ))}
            {quote?.mood && (
              <span
                className="detail-overlay__mood-tag text-card-accent"
                data-reveal
                style={{ borderColor: "color-mix(in srgb, var(--card-accent) 27%, transparent)" }}
              >
                {quote.mood}
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
