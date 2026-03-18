"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { QuoteData } from "@/types/quote";
import type { PublicProfile } from "@/types/profile";
import { getBackground } from "@/lib/backgrounds";
import { getCardPaletteStyle } from "@/lib/quote-presets";
import { cn } from "@/lib/cn";
import SiteHeader from "@/components/SiteHeader";
import { BackToHome } from "@/components/BackToHome";
import QuoteOverlay from "@/components/QuoteOverlay";

interface ProfileClientProps {
  profile: PublicProfile;
  quotes: QuoteData[];
  isOwnProfile: boolean;
}

function ProfileAvatar({
  src,
  name,
  size = 96,
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
      className="rounded-full bg-[#ddd] overflow-hidden flex items-center justify-center shrink-0 border-2 border-white shadow-lg"
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
        <span className="text-2xl font-semibold text-muted">{initials}</span>
      )}
    </div>
  );
}

export default function ProfileClient({
  profile,
  quotes: initialQuotes,
  isOwnProfile,
}: ProfileClientProps) {
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [selected, setSelected] = useState<{
    quote: QuoteData;
    rect: { top: number; left: number; width: number; height: number };
    cardRect: { top: number; left: number; width: number; height: number };
  } | null>(null);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/profile/${profile.id}`
      : "";

  const handleSaveBio = async () => {
    setSavingBio(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio: bio.trim() || null }),
      });
      if (res.ok) {
        setIsEditingBio(false);
        router.refresh();
      }
    } finally {
      setSavingBio(false);
    }
  };

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.name} — SlabPixel Quotes`,
          url,
        });
      } catch {
        /* cancelled */
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const avatarSrc = profile.profilePhoto ?? profile.image ?? null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <BackToHome />

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center mb-12 max-md:mb-10">
          <ProfileAvatar src={avatarSrc} name={profile.name} size={120} />
          <h1 className="text-2xl font-semibold mt-6 tracking-tight">
            {profile.name}
          </h1>

          {/* Bio */}
          <div className="mt-4 w-full max-w-md">
            {isOwnProfile && isEditingBio ? (
              <div className="space-y-2">
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Add a bio..."
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm resize-none focus:outline-none focus:ring-2 focus:ring-foreground/20"
                />
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setBio(profile.bio ?? "");
                      setIsEditingBio(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground rounded-full border border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveBio}
                    disabled={savingBio}
                    className="px-4 py-2 text-sm font-medium text-white bg-foreground rounded-full hover:opacity-90 disabled:opacity-60"
                  >
                    {savingBio ? "Saving…" : "Save"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-foreground/70 text-sm leading-relaxed whitespace-pre-wrap">
                  {profile.bio || (isOwnProfile ? "No bio yet." : "")}
                </p>
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingBio(true)}
                    className="mt-2 text-sm font-medium text-foreground/50 hover:text-foreground"
                  >
                    {profile.bio ? "Edit bio" : "Add bio"}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Share profile */}
          <button
            type="button"
            onClick={handleShareProfile}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-foreground bg-[#F8F8F8] rounded-full py-3 px-5 border-0 hover:bg-[#e4e4e4] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M10.7461 0.246094L14.4648 3.96484C14.7109 4.21094 14.7109 4.64844 14.4648 4.89453L10.7461 8.61328C10.5547 8.80469 10.2539 8.85938 10.0078 8.75C9.76172 8.64062 9.625 8.42188 9.625 8.14844V6.61719H8.33984C7.35547 6.61719 6.5625 7.41016 6.5625 8.39453C6.5625 8.72266 6.61719 8.96875 6.72656 9.13281C6.89062 9.40625 6.83594 9.73438 6.61719 9.95312C6.37109 10.1719 6.04297 10.1719 5.76953 10.0078C5.57812 9.84375 5.33203 9.67969 5.11328 9.43359C4.48438 8.80469 3.9375 7.90234 3.9375 6.61719C3.9375 4.21094 5.87891 2.24219 8.3125 2.24219H9.625V0.710938C9.625 0.4375 9.76172 0.21875 10.0078 0.109375C10.2539 0 10.5547 0.0546875 10.7461 0.246094ZM10.9375 2.89844C10.9375 3.25391 10.6367 3.55469 10.2812 3.55469H8.3125C6.61719 3.55469 5.25 4.92188 5.25 6.61719C5.25 6.94531 5.27734 7.21875 5.38672 7.49219C5.76953 6.23438 6.94531 5.30469 8.33984 5.30469H10.2812C10.6367 5.30469 10.9375 5.60547 10.9375 5.96094V6.5625L13.0703 4.42969L10.9375 2.29688V2.89844ZM2.1875 2.67969H2.84375C3.19922 2.67969 3.5 2.98047 3.5 3.33594C3.5 3.69141 3.19922 3.99219 2.84375 3.99219H2.1875C1.69531 3.99219 1.3125 4.375 1.3125 4.86719V11.8672C1.3125 12.3594 1.69531 12.7422 2.1875 12.7422H9.1875C9.65234 12.7422 10.0625 12.3594 10.0625 11.8672V11.2109C10.0625 10.8555 10.3359 10.5547 10.7188 10.5547C11.0742 10.5547 11.375 10.8555 11.375 11.2109V11.8672C11.375 13.0703 10.3906 14.0547 9.1875 14.0547H2.1875C0.957031 14.0547 0 13.0703 0 11.8672V4.86719C0 3.66406 0.957031 2.67969 2.1875 2.67969Z" fill="currentColor" />
            </svg>
            {shareCopied ? "Copied!" : "Share profile"}
          </button>
        </div>

        {/* Quotes grid — Instagram style */}
        <div className="border-t border-border pt-8">
          <h2 className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-6">
            Quotes
          </h2>
          {initialQuotes.length === 0 ? (
            <p className="text-foreground/40 text-sm py-12 text-center">
              {isOwnProfile
                ? "Your published quotes will appear here."
                : "No published quotes yet."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {initialQuotes.map((quote) => (
                <ProfileQuoteCard
                  key={quote.id}
                  quote={quote}
                  onSelect={(rect, cardRect) =>
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
                    })
                  }
                />
              ))}
            </div>
          )}
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

function ProfileQuoteCard({
  quote,
  onSelect,
}: {
  quote: QuoteData;
  onSelect: (rect: DOMRect, cardRect: DOMRect) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bg = getBackground(quote.backgroundId);

  const handleClick = () => {
    if (!containerRef.current || !cardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cardRect = cardRef.current.getBoundingClientRect();
    onSelect(rect, cardRect);
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        "aspect-3/4 rounded-xl overflow-hidden cursor-pointer relative group",
        !bg && "bg-card-bg",
      )}
      style={{
        ...getCardPaletteStyle(quote, 0),
        ...(bg
          ? {
              backgroundImage: `url(${bg.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : null),
      }}
    >
      {bg && <div className="absolute inset-0 bg-black/25" />}
      <div className="absolute inset-2 flex items-center justify-center">
        <div
          ref={cardRef}
          className="w-full rounded-lg bg-card-bg text-card-text p-2 flex flex-col justify-start transform-gpu"
          style={{
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <p className="text-[0.65rem] sm:text-xs font-medium line-clamp-2 leading-tight">
            {quote.text}
          </p>
          <p className="text-[0.55rem] sm:text-[0.65rem] text-card-accent mt-0.5 truncate">
            {quote.attribution}
          </p>
        </div>
      </div>
    </div>
  );
}
