"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { parseSocialHandle, SVG_PATHS } from "@/lib/social";

const SOCIAL_PLACEHOLDERS = [
  "https://www.tiktok.com/@username",
  "https://www.instagram.com/username",
  "https://x.com/username",
];

const MOOD_OPTIONS = [
  "bold",
  "serene",
  "melancholy",
  "minimal",
  "playful",
  "intense",
  "dreamy",
  "raw",
];

const FONT_OPTIONS = [
  "Playfair Display",
  "Cormorant Garamond",
  "Space Grotesk",
  "Libre Baskerville",
  "DM Sans",
  "Inter",
  "Syne",
  "Outfit",
];

const PALETTE_PRESETS = [
  {
    name: "Midnight Rose",
    colors: ["#1a1a2e", "#e94560", "#ffffff", "#999999"],
  },
  { name: "Ocean Depth", colors: ["#0d1b2a", "#778da9", "#e0e1dd", "#415a77"] },
  { name: "Warm Earth", colors: ["#2d2d2d", "#d4a574", "#f5f5dc", "#8b4513"] },
  { name: "Cyber Teal", colors: ["#0b0c10", "#66fcf1", "#c5c6c7", "#45a29e"] },
  { name: "Berry", colors: ["#1a1a1a", "#ff6b6b", "#fefefe", "#c44569"] },
  { name: "Royal Night", colors: ["#16213e", "#0f3460", "#e94560", "#533483"] },
  { name: "Noir", colors: ["#111111", "#ffffff", "#ededed", "#444444"] },
  { name: "Forest", colors: ["#1b4332", "#52b788", "#d8f3dc", "#2d6a4f"] },
];

export default function SubmitPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [text, setText] = useState("");
  const [attribution, setAttribution] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [fontPrimary, setFontPrimary] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);

  // Cycling placeholder for social handle
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const placeholderTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    placeholderTimer.current = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % SOCIAL_PLACEHOLDERS.length);
    }, 2200);
    return () => {
      if (placeholderTimer.current) clearInterval(placeholderTimer.current);
    };
  }, []);

  // Load Google Font when a font is selected, so the preview reflects it
  useEffect(() => {
    if (!fontPrimary) return;
    const id = `gfont-${fontPrimary.replace(/\s+/g, "-")}`;
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontPrimary)}:wght@200;300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  }, [fontPrimary]);

  // Live preview colors
  const palette =
    selectedPalette !== null
      ? PALETTE_PRESETS[selectedPalette].colors
      : ["#1a1a2e", "#e94560", "#ffffff", "#999999"];

  // Parsed social info for preview
  const socialInfo = socialHandle ? parseSocialHandle(socialHandle) : null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          attribution,
          socialHandle: socialHandle || null,
          fontPrimary,
          colorPalette:
            selectedPalette !== null
              ? JSON.stringify(PALETTE_PRESETS[selectedPalette].colors)
              : null,
          mood,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit quote");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 px-6">
          <div className="text-5xl text-foreground">&#x2713;</div>
          <h1 className="text-2xl font-light text-foreground tracking-tight">
            Quote Submitted
          </h1>
          <p className="text-muted max-w-md">
            Your quote has been submitted for review. Our design team will
            curate it and, if approved, transform it into a visual artifact.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link
              href="/"
              className="px-6 py-3 text-sm uppercase tracking-widest text-foreground border border-border rounded-lg hover:bg-foreground/5 transition-colors"
            >
              Back to Grid
            </Link>
            {session && (
              <Link
                href="/dashboard"
                className="px-6 py-3 text-sm uppercase tracking-widest text-background bg-foreground rounded-lg hover:bg-foreground/90 transition-colors"
              >
                My Submissions
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left: Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 md:px-16 lg:px-24 max-w-2xl">
        <Link
          href="/"
          className="text-xs uppercase tracking-widest text-muted mb-12 hover:text-foreground transition-colors inline-block"
        >
          &larr; Back
        </Link>

        <h1 className="text-3xl font-light text-foreground mb-2 tracking-tight">
          Submit a Quote
        </h1>
        <p className="text-muted text-sm mb-10">
          Share words that matter. Shape how they look and feel.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Quote text */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-3">
              The Quote *
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              minLength={10}
              maxLength={500}
              rows={4}
              className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground text-lg font-light resize-none focus:outline-none focus:border-accent transition-colors placeholder:text-muted/40"
              placeholder="Type your quote here..."
            />
            <span className="text-xs text-muted mt-1 block">
              {text.length}/500
            </span>
          </div>

          {/* Attribution */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-3">
                Attribution *
              </label>
              <input
                type="text"
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                required
                maxLength={100}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted/40"
                placeholder="Name or alias"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted mb-3">
                Social Handle
              </label>
              <input
                type="url"
                value={socialHandle}
                onChange={(e) => setSocialHandle(e.target.value)}
                maxLength={200}
                className="w-full bg-transparent border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-accent transition-colors placeholder:text-muted/40"
                placeholder={SOCIAL_PLACEHOLDERS[placeholderIdx]}
              />
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-3">
              Mood
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(mood === m ? null : m)}
                  className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                    mood === m
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-3">
              Font Style
            </label>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFontPrimary(fontPrimary === f ? null : f)}
                  className={`px-4 py-2 text-xs rounded-full border transition-all cursor-pointer ${
                    fontPrimary === f
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-foreground/30 hover:text-foreground"
                  }`}
                  style={{ fontFamily: f }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted mb-3">
              Color Palette
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PALETTE_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setSelectedPalette(selectedPalette === idx ? null : idx)
                  }
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPalette === idx
                      ? "border-accent"
                      : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex gap-1">
                    {p.colors.map((c, ci) => (
                      <div
                        key={ci}
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-[0.65rem] text-muted uppercase tracking-wider">
                    {p.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !text || !attribution}
            className="w-full py-4 bg-foreground text-background font-medium text-sm uppercase tracking-widest rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Submit Quote"}
          </button>

          {!session && (
            <p className="text-xs text-muted text-center">
              <Link href="/sign-in" className="text-accent hover:underline">
                Sign in
              </Link>{" "}
              to track your submissions in your dashboard.
            </p>
          )}
        </form>
      </div>

      {/* Right: Live Preview */}
      <div className="hidden lg:flex flex-1 items-center justify-center p-12">
        {/* Match actual WebGL card: 500×400 (5:4 landscape) */}
        <div
          className="quote-card"
          data-mood={mood ?? undefined}
          style={{
            backgroundColor: palette[0],
            color: palette[2],
            width: "24vw",
            height: "calc(24vw * 4 / 5)",
            minHeight: "unset",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Always-on radial gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `radial-gradient(ellipse at bottom right, ${palette[1]}18 0%, transparent 70%)`,
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />

          {/* Mood CSS-effect layer — mirrors real card */}
          {mood && (
            <div
              className={`quote-card__mood-fx quote-card__mood-fx--${mood}`}
            />
          )}

          <div style={{ position: "relative", zIndex: 1 }}>
            <p
              className="quote-card__text"
              style={{
                fontFamily: fontPrimary ? `"${fontPrimary}", serif` : undefined,
                fontWeight:
                  mood === "bold" || mood === "intense" ? 500 : undefined,
              }}
            >
              &ldquo;{text || "Your quote will appear here..."}&rdquo;
            </p>
          </div>

          <div
            className="quote-card__footer"
            style={{ position: "relative", zIndex: 1 }}
          >
            <span
              className="quote-card__attribution"
              style={{ color: palette[1] }}
            >
              {attribution || "Attribution"}
            </span>
            {socialInfo && (
              <span
                className="quote-card__handle"
                style={{
                  color: palette[3],
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  opacity: 1,
                }}
              >
                {socialInfo.platform !== "unknown" &&
                  SVG_PATHS[socialInfo.platform] && (
                    <svg
                      viewBox="0 0 24 24"
                      style={{
                        width: "0.75em",
                        height: "0.75em",
                        fill: "currentColor",
                        flexShrink: 0,
                      }}
                    >
                      <path d={SVG_PATHS[socialInfo.platform]} />
                    </svg>
                  )}
                {socialInfo.username}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
