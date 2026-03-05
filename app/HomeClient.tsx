"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type QuoteData } from "@/types/quote";
import { getBackground } from "@/lib/backgrounds";
import { cn } from "@/lib/cn";

// ── Placeholder quotes shown when DB is empty ──────────────────────────────
const PLACEHOLDER_QUOTES: QuoteData[] = [
  {
    id: "ph-1",
    text: "The best way to predict the future is to design it.",
    attribution: "Buckminster Fuller",
    socialHandle: null,
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Switzer",
    fontSecondary: "Inter",
    colorPalette: null,
    mood: "bold",
    cardImageUrl: null,
    publishedAt: new Date().toISOString(),
    submitter: { id: "s1", name: "Dianna", profilePhoto: null, image: null },
  },
  {
    id: "ph-2",
    text: "White space is to be regarded as an active element, not a passive background.",
    attribution: "Jan Tschichold",
    socialHandle: null,
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Cormorant Garamond",
    fontSecondary: "Source Sans Pro",
    colorPalette: null,
    mood: "serene",
    cardImageUrl: null,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
    submitter: { id: "s2", name: "Robert", profilePhoto: null, image: null },
  },
  {
    id: "ph-3",
    text: "Good design is as little design as possible.",
    attribution: "Dieter Rams",
    socialHandle: null,
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Space Grotesk",
    fontSecondary: "DM Sans",
    colorPalette: null,
    mood: "minimal",
    cardImageUrl: null,
    publishedAt: new Date(Date.now() - 172800000).toISOString(),
    submitter: null,
  },
];

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
  size = 36,
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
      className="inline-flex items-center gap-[0.4rem] font-sans text-[0.65rem] tracking-[0.07em] uppercase text-foreground bg-[#f0f0f0] border-0 rounded-full px-4 py-[0.45rem] cursor-pointer transition-colors hover:bg-[#e4e4e4]"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        width={13}
        height={13}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
        />
      </svg>
      {copied ? "Copied!" : "Share Quote"}
    </button>
  );
}

// ── Submit CTA card — first child of the feed list ────────────────────────
function SubmitCard({ total }: { total: number }) {
  return (
    <div className="grid grid-cols-[4rem_8rem_1fr_12rem] items-center max-[860px]:grid-cols-[3rem_1fr]">
      {/* Col 1: empty */}
      <div aria-hidden="true" />

      {/* Col 2: top dot */}
      <div aria-hidden="true" />

      {/* Col 3: CTA card */}
      <div className="relative flex flex-col items-start justify-start overflow-hidden">
          <Link
            href="/submit"
            className="inline-flex items-center gap-[0.45rem] font-[inherit] text-[0.65rem] tracking-[0.08em] uppercase text-foreground bg-[#ECECEC] rounded-full py-2 px-[1.1rem] no-underline transition-opacity  w-fit hover:opacity-85"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              width={13}
              height={13}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Submit a Quote
          </Link>
        </div>

      {/* Col 4: empty */}

      <div aria-hidden="true" />
    </div>
  );
}

// ── Feed item ──────────────────────────────────────────────────────────────
function FeedItem({
  quote,
  index,
  total,
  isLast,
}: {
  quote: QuoteData;
  index: number;
  total: number;
  isLast: boolean;
}) {
  const no = total - index;
  const date = formatDate(quote.publishedAt);
  const today = isToday(quote.publishedAt);
  const avatarSrc = resolveAvatar(quote.submitter);
  const submitterName = quote.submitter?.name ?? "Anonymous";
  const bg = getBackground(quote.backgroundId);

  return (
    <article className="grid grid-cols-[4rem_8rem_1fr_12rem] items-center min-h-[340px] gap-0 max-[860px]:grid-cols-[3rem_1fr] max-[860px]:grid-rows-[auto_auto] max-[860px]:min-h-0 max-[860px]:gap-y-3">
      {/* ── 1 · Index number ─────────────────────────── */}
      <div className="flex flex-col items-end pr-3 leading-[1.1] select-none max-[860px]:row-start-1 max-[860px]:col-start-1 max-[860px]:items-start max-[860px]:pr-0">
        <span className="text-sm">
          No.
        </span>
        <span className="text-sm text-foreground">
          {no}
        </span>
      </div>

      {/* ── 2 · Timeline column ───────────────────────── */}
      <div className="relative h-full flex items-center justify-end pr-5 max-[860px]:hidden">
        <div className="flex flex-col items-end text-sm leading-[1.5] select-none bg-white p-4">
          <span>{date.day}</span>
          <span>{date.year}</span>
        </div>
        {isLast && (
          <span className="absolute left-1/2 -translate-x-1/2 bottom-0 w-[7px] h-[7px] rounded-full bg-foreground border-2 border-background outline outline-1 outline-foreground" />
        )}
      </div>

      {/* ── 3 · Card ──────────────────────────────────── */}
      <div
        className={cn(
          "rounded-4xl h-full relative flex items-center justify-center min-h-[320px] overflow-hidden p-8",
          "max-[860px]:row-start-1 max-[860px]:col-start-2 max-[860px]:min-h-0 max-[860px]:p-5",
          bg ? "" : "bg-[#ebebeb]",
        )}
        style={
          bg
            ? {
                backgroundImage: `url(${bg.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {/* Overlay only when a background image is set */}
        {bg && (
          <div className="absolute inset-0 bg-black/[0.22] rounded-[inherit] z-0" />
        )}

        <div
          className="relative z-1 bg-white rounded-4xl p-4 max-w-95 w-full flex flex-col gap-[0.6rem] shadow-[0_2px_20px_rgba(0,0,0,0.07)]"
          style={{
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <blockquote className="text-[1.2rem] font-medium leading-[1.5] text-foreground m-0">
            {quote.text}
          </blockquote>
          <cite className="text-[0.78rem] text-muted not-italic block">
            {quote.attribution}
          </cite>
          <div className="flex justify-end mt-2">
            <ShareButton quote={quote} />
          </div>
        </div>
      </div>

      {/* ── 4 · Right meta ──────────────────────────── */}
      <div className="pl-5 flex items-center max-[860px]:row-start-2 max-[860px]:col-start-2 max-[860px]:pl-0">
        {today && (
          <div className="flex flex-row items-center gap-[0.85rem] flex-nowrap">
            <p className="text-[0.55rem] tracking-[0.1em] uppercase text-muted leading-[1.6] m-0 shrink-0">
              Quotes
              <br />
              of Today
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Avatar src={avatarSrc} name={submitterName} />
              <div className="flex flex-col leading-[1.3]">
                <span className="text-[0.5rem] tracking-[0.1em] uppercase text-muted">
                  By
                </span>
                <span className="text-[0.7rem] font-medium text-foreground">
                  {submitterName}
                </span>
              </div>
            </div>
          </div>
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
  const displayQuotes = quotes.length > 0 ? quotes : PLACEHOLDER_QUOTES;
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // ── GSAP ScrollTrigger — smooth scrubbed timeline fill ──────────────────
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[1100px] mx-auto px-10 py-24 max-[860px]:px-5 max-[860px]:pt-20 max-[860px]:pb-16">
        <div className="relative">
          {/* Animated vertical timeline line — GSAP scrubs height */}
          <div
            className="absolute left-32 top-0 bottom-0 w-px bg-border -translate-x-1/2 pointer-events-none max-[860px]:hidden"
            aria-hidden="true"
          >
            <div
              className="w-full bg-foreground origin-top"
              ref={fillRef}
              style={{ height: "0%" }}
            />
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
                isLast={i === displayQuotes.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
