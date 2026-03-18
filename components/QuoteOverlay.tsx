"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { QuoteData } from "@/types/quote";
import { getBackground } from "@/lib/backgrounds";
import { getCardPaletteStyle } from "@/lib/quote-presets";
import { QuoteShareMenu } from "@/components/QuoteShareMenu";

interface QuoteOverlayProps {
  quote: QuoteData;
  rect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  cardRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  onClose: () => void;
}

export default function QuoteOverlay({ quote, rect, cardRect, onClose }: QuoteOverlayProps) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const whiteCardRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null); // round X button only
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Compute background image / colors
  const bg = getBackground(quote.backgroundId);

  // Opening: frame expands from feed rect to fullscreen; card stays centered in frame (flex) so it moves with it to viewport center
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const whiteCard = whiteCardRef.current;
    if (!frame || !whiteCard) return;

    const { top, left, width, height } = rect;
    const { width: cWidth, height: cHeight } = cardRect;

    gsap.set(frame, {
      position: "fixed",
      top,
      left,
      width,
      height,
      borderRadius: 32,
      overflow: "hidden",
      zIndex: 140,
    });

    // Position white card in viewport coordinates (fixed) so it animates straight to center, not toward the frame’s center
    gsap.set(whiteCard, { width: cWidth, height: cHeight });

    const closeBtn = closeButtonRef.current;
    if (closeBtn) gsap.set(closeBtn, { opacity: 0, visibility: "visible", x: -32, y: 32 });

    const tl = gsap.timeline();
    tl.to(
      frame,
      {
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        borderRadius: 0,
        duration: 0.7,
        ease: "power3.inOut",
      },
      0,
    )
    tl.to(
      whiteCard,
      {
        scale: 1.2,
        ease: "power3.inOut",
        duration: 0.7,
      },
      "<0.1",
    )
    if (closeBtn) {
      tl.to(closeBtn,
        {
          opacity: 1,
          duration: 0.35,
          ease: "power2.out",
          x: 0,
          y: 0
        }
        , 0.4);
    }

    // White card FLIPs to viewport center (fixed coords so no “upper left” jump)
    tlRef.current = tl;

    return () => {
      tl.kill();
      tlRef.current = null;
    };
  }, [rect, cardRect]);

  // Close with reverse animation
  const handleClose = () => {
    const frame = frameRef.current;
    const tl = tlRef.current;

    if (!frame || !tl) {
      onClose();
      return;
    }

    tl.eventCallback("onReverseComplete", () => {
      onClose();
    });

    tl.reverse();
  };

  // Close on Escape key
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        handleClose();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  });

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Quote by ${quote.attribution}`}
      style={getCardPaletteStyle(quote, 0)}
      className="flex items-center justify-center relative bg-card-bg"
    >
      {/* Background image / overlay */}
      {bg ? (
        <>
          <Image
            src={bg.src}
            alt={bg.label}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/30" />
        </>
      ) : (
        <div className="absolute inset-0 bg-[#ebebeb]" />
      )}

      {/* Click backdrop: close modal when clicking the background */}
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 z-1 cursor-default"
        onClick={handleClose}
      />

      {/* White card + close button (close outer top-right of card) */}
      <div className="relative z-2 flex flex-col items-end">
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute -top-16 -right-16 z-10 h-11 w-11 shrink-0 rounded-full border-0 bg-white text-foreground shadow-[0_2px_12px_rgba(0,0,0,0.08)] flex items-center justify-center cursor-pointer hover:bg-card-bg transition-colors invisible"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div
          ref={whiteCardRef}
          className="group relative bg-white rounded-4xl p-4 max-w-97 w-full flex flex-col justify-between min-h-69 gap-4"
          style={{
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <div className="flex flex-col gap-4 w-full">
            <blockquote className="text-lg font-medium leading-1.4 text-foreground m-0">
              {quote.text}
            </blockquote>
            <cite className="text-sm text-foreground/50 not-italic block">
              {quote.attribution}
            </cite>
          </div>
          <div className="flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <QuoteShareMenu quote={quote} />
          </div>
        </div>
      </div>
    </div>
  );
}

