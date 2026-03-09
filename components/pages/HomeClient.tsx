"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { type QuoteData } from "@/types/quote";
import { getBackground } from "@/lib/backgrounds";
import { cn } from "@/lib/cn";

gsap.registerPlugin(useGSAP, ScrollTrigger);


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
<path d="M10.7461 0.246094L14.4648 3.96484C14.7109 4.21094 14.7109 4.64844 14.4648 4.89453L10.7461 8.61328C10.5547 8.80469 10.2539 8.85938 10.0078 8.75C9.76172 8.64062 9.625 8.42188 9.625 8.14844V6.61719H8.33984C7.35547 6.61719 6.5625 7.41016 6.5625 8.39453C6.5625 8.72266 6.61719 8.96875 6.72656 9.13281C6.89062 9.40625 6.83594 9.73438 6.61719 9.95312C6.37109 10.1719 6.04297 10.1719 5.76953 10.0078C5.57812 9.84375 5.33203 9.67969 5.11328 9.43359C4.48438 8.80469 3.9375 7.90234 3.9375 6.61719C3.9375 4.21094 5.87891 2.24219 8.3125 2.24219H9.625V0.710938C9.625 0.4375 9.76172 0.21875 10.0078 0.109375C10.2539 0 10.5547 0.0546875 10.7461 0.246094ZM10.9375 2.89844C10.9375 3.25391 10.6367 3.55469 10.2812 3.55469H8.3125C6.61719 3.55469 5.25 4.92188 5.25 6.61719C5.25 6.94531 5.27734 7.21875 5.38672 7.49219C5.76953 6.23438 6.94531 5.30469 8.33984 5.30469H10.2812C10.6367 5.30469 10.9375 5.60547 10.9375 5.96094V6.5625L13.0703 4.42969L10.9375 2.29688V2.89844ZM2.1875 2.67969H2.84375C3.19922 2.67969 3.5 2.98047 3.5 3.33594C3.5 3.69141 3.19922 3.99219 2.84375 3.99219H2.1875C1.69531 3.99219 1.3125 4.375 1.3125 4.86719V11.8672C1.3125 12.3594 1.69531 12.7422 2.1875 12.7422H9.1875C9.65234 12.7422 10.0625 12.3594 10.0625 11.8672V11.2109C10.0625 10.8555 10.3359 10.5547 10.7188 10.5547C11.0742 10.5547 11.375 10.8555 11.375 11.2109V11.8672C11.375 13.0703 10.3906 14.0547 9.1875 14.0547H2.1875C0.957031 14.0547 0 13.0703 0 11.8672V4.86719C0 3.66406 0.957031 2.67969 2.1875 2.67969Z" fill="black"/>
</svg>

      {copied ? "Copied!" : "Share Quote"}
    </button>
  );
}

// ── Submit CTA card — first child of the feed list ────────────────────────
function SubmitCard({ total }: { total: number }) {
  return (
    <div className="grid grid-cols-[4rem_8rem_1fr_4rem_6rem] gap-8 items-center max-[860px]:grid-cols-[1fr]">
      {/* Col 1: empty */}
      <div aria-hidden="true" />

      {/* Col 2: top dot */}
      <div aria-hidden="true" />

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

      <div aria-hidden="true" />

      {/* Col 5: empty */}
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
    <article className="grid grid-cols-[4rem_8rem_1fr_4rem_6rem] items-center min-h-110 gap-8 max-[860px]:grid-cols-[1fr] max-[860px]:grid-rows-[auto] max-[860px]:min-h-0 max-[860px]:gap-2">
      {/* ── 1 · Index number ─────────────────────────── */}
      <div className="max-[860px]:hidden flex flex-col items-end leading-[1.1] select-none max-[860px]:row-start-1 max-[860px]:col-start-1 max-[860px]:items-start max-[860px]:pr-0">
        <span className="text-sm">
          No.
        </span>
        <span className="text-sm text-foreground">
          {no}
        </span>
      </div>

      {/* ── 2 · Timeline column ───────────────────────── */}
      <div className="relative h-full flex items-center justify-end max-[860px]:hidden">
        <div className="flex flex-col items-end text-sm py-4 leading-normal select-none bg-white">
          <span>{date.day}</span>
          <span>{date.year}</span>
        </div>
        {isLast && (
          <span className="absolute right-[14px] bottom-0 size-2 rounded-full bg-muted" />
        )}
      </div>

      {/* ── 3 · Card ──────────────────────────────────── */}
      <div
        className={cn(
          "rounded-4xl h-full relative flex items-center justify-center min-h-[320px] overflow-hidden p-8",
          "max-[860px]:row-start-1 max-[860px]:min-h-0 max-[860px]:px-8 max-[860px]:py-18",
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
          <div className="absolute inset-0 bg-black/22 rounded-[inherit] z-0" />
        )}

        <div
          className="relative z-1 bg-white rounded-4xl p-4 max-w-95 w-full flex flex-col gap-[0.6rem] shadow-[0_2px_20px_rgba(0,0,0,0.07)]"
          style={{
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <blockquote className="text-[1.2rem] font-medium leading-normal text-foreground m-0">
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
      <div className="max-[860px]:hidden flex items-center max-[860px]:row-start-2 max-[860px]:col-start-2 max-[860px]:pl-0">
        {today && (
          <div className="flex flex-row items-center gap-[0.85rem] flex-nowrap">
            <p className="text-[0.55rem] tracking-widest uppercase text-muted leading-[1.6] m-0 shrink-0">
              Quotes
              <br />
              of Today
            </p>
          </div>
        )}
      </div>

      {/* ── 5 · Submitter info ──────────────────────────── */}
      <div className="max-[860px]:hidden flex items-center gap-2 shrink-0">
        <Avatar src={avatarSrc} name={submitterName} />
        <div className="flex flex-col leading-none text-sm">
          <span>
            By
          </span>
          <span>
            {submitterName}
          </span>
        </div>
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-10 py-24 pt-[25vh] max-[860px]:px-2 max-[860px]:pt-20 max-[860px]:pb-16">
        <div className="relative">
          {/* Animated vertical timeline line — GSAP scrubs height */}
          <div
            className="absolute left-51.5 top-0 bottom-0 w-px bg-border -translate-x-1/2 pointer-events-none max-[860px]:hidden"
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
