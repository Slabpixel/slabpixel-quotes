"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import type { QuoteData } from "@/types/quote";
import { getBackground } from "@/lib/backgrounds";
import { getPaletteForQuote } from "@/lib/quote-presets";

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
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  // Compute background image / colors
  const bg = getBackground(quote.backgroundId);
  const palette = getPaletteForQuote(quote, 0);
  const bgColor = palette[0] || "#111111";

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
    );

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

  function ShareButton({ quote }: { quote: QuoteData }) {
    const [copied, setCopied] = useState(false);
  
    const handleShare = async () => {
      const text = `"${quote.text}" — ${quote.attribution}`;
      try {
        if (navigator.share) {
          await navigator.share({ text });
        } else {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch {
        /* cancelled */
      }
    };
  
    return (
      <button
        onClick={handleShare}
        className="inline-flex items-center gap-2 font-medium font-sans text-sm text-foreground bg-[#F8F8F8] border-0 rounded-full px-4 py-3 leading-none cursor-pointer transition-colors hover:bg-[#e4e4e4]"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10.7461 0.246094L14.4648 3.96484C14.7109 4.21094 14.7109 4.64844 14.4648 4.89453L10.7461 8.61328C10.5547 8.80469 10.2539 8.85938 10.0078 8.75C9.76172 8.64062 9.625 8.42188 9.625 8.14844V6.61719H8.33984C7.35547 6.61719 6.5625 7.41016 6.5625 8.39453C6.5625 8.72266 6.61719 8.96875 6.72656 9.13281C6.89062 9.40625 6.83594 9.73438 6.61719 9.95312C6.37109 10.1719 6.04297 10.1719 5.76953 10.0078C5.57812 9.84375 5.33203 9.67969 5.11328 9.43359C4.48438 8.80469 3.9375 7.90234 3.9375 6.61719C3.9375 4.21094 5.87891 2.24219 8.3125 2.24219H9.625V0.710938C9.625 0.4375 9.76172 0.21875 10.0078 0.109375C10.2539 0 10.5547 0.0546875 10.7461 0.246094ZM10.9375 2.89844C10.9375 3.25391 10.6367 3.55469 10.2812 3.55469H8.3125C6.61719 3.55469 5.25 4.92188 5.25 6.61719C5.25 6.94531 5.27734 7.21875 5.38672 7.49219C5.76953 6.23438 6.94531 5.30469 8.33984 5.30469H10.2812C10.6367 5.30469 10.9375 5.60547 10.9375 5.96094V6.5625L13.0703 4.42969L10.9375 2.29688V2.89844ZM2.1875 2.67969H2.84375C3.19922 2.67969 3.5 2.98047 3.5 3.33594C3.5 3.69141 3.19922 3.99219 2.84375 3.99219H2.1875C1.69531 3.99219 1.3125 4.375 1.3125 4.86719V11.8672C1.3125 12.3594 1.69531 12.7422 2.1875 12.7422H9.1875C9.65234 12.7422 10.0625 12.3594 10.0625 11.8672V11.2109C10.0625 10.8555 10.3359 10.5547 10.7188 10.5547C11.0742 10.5547 11.375 10.8555 11.375 11.2109V11.8672C11.375 13.0703 10.3906 14.0547 9.1875 14.0547H2.1875C0.957031 14.0547 0 13.0703 0 11.8672V4.86719C0 3.66406 0.957031 2.67969 2.1875 2.67969Z" fill="black" />
        </svg>
  
        {copied ? "Copied!" : "Share Quote"}
      </button>
    );
  }

  return (
    <div
      ref={frameRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Quote by ${quote.attribution}`}
      style={{ backgroundColor: bgColor }}
      className="flex items-center justify-center relative"
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
        aria-label="Close"
        className="absolute inset-0 z-1 cursor-default"
        onClick={handleClose}
      />

      {/* White card */}
      <div
          ref={whiteCardRef}
          className="relative z-2 bg-white rounded-4xl p-4 max-w-97 w-full flex flex-col justify-between min-h-69 gap-4"
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
          <div className="flex justify-end ">
            <ShareButton quote={quote} />
          </div>
        </div>
    </div>
  );
}

