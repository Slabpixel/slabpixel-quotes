"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type QuoteData } from "@/types/quote";
import { resolveQuoteBackground } from "@/lib/quote-background";
import { getCardPaletteStyle } from "@/lib/quote-presets";
import { PLACEHOLDER_QUOTES_FEED } from "@/lib/placeholder-quotes";
import { cn } from "@/lib/cn";
import { useLenis } from "lenis/react";
import QuoteOverlay from "@/components/QuoteOverlay";
import { QuoteShareMenu } from "@/components/QuoteShareMenu";

gsap.registerPlugin(useGSAP, ScrollTrigger);


// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso: string | null) {
  if (!iso) return { day: "—", year: "" };
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-US", { month: "long", day: "numeric" }),
    year: String(d.getFullYear()),
  };
}

function isToday(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).toDateString() === new Date().toDateString();
}

function resolveAvatar(submitter: QuoteData["submitter"]): string | null {
  if (!submitter) return null;
  return submitter.profilePhoto ?? submitter.image ?? null;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function Avatar({
  src,
  name,
  size = 40,
}: {
  src: string | null;
  name: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="rounded-full bg-[#ddd] overflow-hidden flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-[0.65rem] font-semibold text-muted">
          {initials}
        </span>
      )}
    </div>
  );
}

// ── Submit CTA card — first child of the feed list ────────────────────────
function SubmitCard({ total }: { total: number }) {
  return (
    <div className="grid grid-cols-[1fr_1fr_6fr_1fr_1fr] gap-8 items-center max-lg:grid-cols-[1fr]">
      {/* Col 1: empty */}
      <div aria-hidden="true" className="max-lg:hidden" />

      {/* Col 2: top dot */}
      <div aria-hidden="true" className="max-lg:hidden" />

      {/* Col 3: CTA card */}
      <div className="relative flex flex-col items-start justify-start overflow-hidden">
        <Link
          href="/submit"
          className="inline-flex items-center leading-none gap-2 text-sm font-medium text-foreground bg-[#ECECEC] rounded-full py-3 px-4 no-underline transition-opacity w-fit hover:opacity-85"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.42188 10.5273C0.519531 9.43359 0 8.03906 0 6.5625C0 2.95312 3.14453 0 7 0C10.8555 0 14 2.95312 14 6.5625C14 10.1992 10.8555 13.125 7 13.125C6.01562 13.125 5.05859 12.9336 4.18359 12.5781L1.01172 13.9453C0.902344 14 0.820312 14 0.710938 14C0.300781 14 0 13.6992 0 13.3164C0 13.1797 0.0273438 13.0703 0.0820312 12.9609L1.42188 10.5273ZM2.43359 9.70703C2.76172 10.1172 2.81641 10.6914 2.57031 11.1562L2.07812 12.0586L3.69141 11.375C3.99219 11.2383 4.375 11.2383 4.70312 11.375C5.38672 11.6484 6.17969 11.8125 7 11.8125C10.2266 11.8125 12.6875 9.37891 12.6875 6.5625C12.6875 3.74609 10.2266 1.3125 7 1.3125C3.77344 1.3125 1.3125 3.74609 1.3125 6.5625C1.3125 7.73828 1.72266 8.80469 2.43359 9.70703Z" fill="black" />
          </svg>

          Submit a Quote
        </Link>
      </div>

      {/* Col 4: empty */}

      <div aria-hidden="true" className="max-lg:hidden" />

      {/* Col 5: empty */}
      <div aria-hidden="true" className="max-lg:hidden" />
    </div>
  );
}

// ── Feed item ──────────────────────────────────────────────────────────────
function FeedItem({
  quote,
  index,
  total,
  isSelected,
  onSelect,
}: {
  quote: QuoteData;
  index: number;
  total: number;
  isSelected?: boolean;
  onSelect: (payload: { quote: QuoteData; rect: DOMRect; cardRect: DOMRect }) => void;
}) {
  const no = total - index;
  const date = formatDate(quote.publishedAt);
  const today = isToday(quote.publishedAt);
  const avatarSrc = resolveAvatar(quote.submitter);
  const submitterName = quote.submitter?.name ?? "Anonymous";
  const bgResolved = resolveQuoteBackground(quote);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const whiteCardRef = useRef<HTMLDivElement | null>(null);

  const handleClick = () => {
    if (!containerRef.current || !whiteCardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cardRect = whiteCardRef.current.getBoundingClientRect();
    onSelect({ quote, rect, cardRect });
  };

  return (
    <article className="grid grid-cols-[1fr_1fr_6fr_1fr_1fr] items-center min-h-110 gap-8 max-lg:grid-cols-[1fr] max-lg:grid-rows-[auto] max-lg:min-h-0 max-lg:gap-2">
      {/* ── 1 · Index number ─────────────────────────── */}
      <div className="max-lg:hidden flex flex-col items-end leading-[1.1] select-none max-lg:row-start-1 max-lg:col-start-1 max-lg:items-start max-lg:pr-0">
        <span className="text-sm">
          No.
        </span>
        <span className="text-sm text-foreground">
          {no}
        </span>
      </div>

      {/* ── 2 · Timeline column ───────────────────────── */}
      <div className="relative h-full flex items-center justify-end max-lg:hidden">
        <div className="flex flex-col items-end text-sm py-4 leading-none select-none bg-white">
          <span>{date.day}</span>
          <span>{date.year}</span>
        </div>
      </div>

      {/* ── 3 · Card ──────────────────────────────────── */}
      <div
        ref={containerRef}
        onClick={handleClick}
        className={cn(
          "rounded-4xl h-full relative flex items-center justify-center min-h-[320px] overflow-hidden p-8 cursor-pointer",
          "max-lg:row-start-1 max-lg:min-h-0 max-lg:px-8 max-lg:py-19",
          bgResolved.type !== "none" ? "" : "bg-[#ebebeb]",
        )}
        style={
          bgResolved.type !== "none"
            ? {
              backgroundImage: `url(${bgResolved.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
            : undefined
        }
      >
        {/* Overlay only when a background image is set */}
        {bgResolved.type !== "none" && (
          <div className="absolute inset-0 bg-black/22 rounded-[inherit] z-0" />
        )}

        <div
          ref={whiteCardRef}
          className={cn(
            "group relative z-1 bg-card-bg text-card-text rounded-4xl p-4 max-w-97 w-full flex flex-col justify-between min-h-69 gap-4",
            isSelected && "invisible",
          )}
          style={{
            ...getCardPaletteStyle(quote, index),
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <div className="flex flex-col gap-4 w-full">
            <blockquote className="text-lg font-medium leading-1.4 m-0">
              {quote.text}
            </blockquote>
            <cite className="text-sm text-card-accent not-italic block">
              {quote.attribution}
            </cite>
          </div>
          <div
            className="flex justify-end opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <QuoteShareMenu quote={quote} />
          </div>
        </div>
      </div>

      {/* ── 4 · Right meta ──────────────────────────── */}
      <div className="max-lg:hidden flex items-center max-lg:row-start-2 max-lg:col-start-2 max-lg:pl-0">
        {today && (
          <div className="flex flex-row items-center gap-[0.85rem] flex-nowrap">
            <p className="text-sm m-0 shrink-0">
              Quotes
              <br />
              of Today
            </p>
          </div>
        )}
      </div>

      {/* ── 5 · Submitter info ──────────────────────────── */}
      <div className="max-lg:hidden flex items-center gap-2 shrink-0">
        {quote.submitter?.id ? (
          <Link
            href={`/profile/${quote.submitter.id}`}
            className="flex items-center gap-2 no-underline text-foreground hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar src={avatarSrc} name={submitterName} />
            <div className="flex flex-col leading-none text-sm">
              <span>By</span>
              <span className="truncate line-clamp-1 max-w-24">{submitterName}</span>
            </div>
          </Link>
        ) : (
          <>
            <Avatar src={avatarSrc} name={submitterName} />
            <div className="flex flex-col leading-none text-sm">
              <span>By</span>
              <span className="truncate line-clamp-1 max-w-24">{submitterName}</span>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

// ── Page client ────────────────────────────────────────────────────────────
interface HomeClientProps {
  quotes: QuoteData[];
}

export default function HomeClient({ quotes }: HomeClientProps) {
  const [selected, setSelected] = useState<{
    quote: QuoteData;
    rect: { top: number; left: number; width: number; height: number };
    cardRect: { top: number; left: number; width: number; height: number };
  } | null>(null);

  const lenis = useLenis();

  const displayQuotes = quotes.length > 0 ? quotes : PLACEHOLDER_QUOTES_FEED;
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Pause Lenis when overlay is open
  useEffect(() => {
    if (!lenis) return;
    if (selected) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [lenis, selected]);

  // ── GSAP ScrollTrigger — smooth scrubbed timeline fill (synced via Lenis + gsap.ticker) ──────────────────
  useGSAP(() => {

    const fill = fillRef.current;
    const list = listRef.current;
    if (!fill || !list) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fill,
        { height: "0%" },
        {
          height: "100%",
          ease: "none",
          scrollTrigger: {
            trigger: list,
            start: "top center",
            end: "bottom center",
            scrub: 0.6,
          },
        },
      );
    });

    return () => ctx.revert();
  }, []);

  // ── Load Google Fonts for custom fontPrimary values ──────────────────────
  useEffect(() => {
    const fonts = [
      ...new Set(
        displayQuotes.map((q) => q.fontPrimary).filter((f): f is string => !!f),
      ),
    ];
    fonts.forEach((fontName) => {
      const id = `gfont-home-${fontName.replace(/\s+/g, "-")}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, [displayQuotes]);

  return (
    <div className="min-h-screen bg-background text-foreground no-scrollbar">
      <div className="max-w-8xl mx-auto px-10 py-24 pt-[25vh] max-lg:px-2 max-lg:pt-20 max-lg:pb-16">
        <div className="relative">
          {/* Animated vertical timeline line — GSAP scrubs height */}
          <div className="grid grid-cols-[1fr_1fr_6fr_1fr_1fr] max-lg:grid-cols-[1fr] absolute inset-0 mt-4 pointer-events-none">
            <div aria-hidden="true" className="max-lg:hidden" />
            <div
              className="relative h-full w-px bg-border pointer-events-none max-lg:hidden place-self-end max-xl:mr-2"
              aria-hidden="true"
            >
              <div
                className="w-full bg-foreground origin-top"
                ref={fillRef}
                style={{ height: "0%" }}
              />
              <div className="absolute left-1/2 -translate-x-1/2 top-0 size-2 rounded-full bg-foreground" />
              <div className="absolute left-1/2 -translate-x-1/2 bottom-0 size-2 rounded-full bg-muted" />
            </div>
          </div>

          {/* Submit card first, then quote items */}
          <div className="flex flex-col gap-2" ref={listRef}>
            <SubmitCard total={displayQuotes.length} />
            {displayQuotes.map((quote, i) => (
              <FeedItem
                key={quote.id}
                quote={quote}
                index={i}
                total={displayQuotes.length}
                isSelected={selected?.quote.id === quote.id}
                onSelect={({ quote, rect, cardRect }) => {
                  setSelected({
                    quote,
                    rect: {
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height,
                    },
                    cardRect: {
                      top: cardRect.top,
                      left: cardRect.left,
                      width: cardRect.width,
                      height: cardRect.height,
                    },
                  });
                }}
              />
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <QuoteOverlay
          quote={selected.quote}
          rect={selected.rect}
          cardRect={selected.cardRect}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
