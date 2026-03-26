"use client";

import {
  useState,
  useEffect,
  useRef,
  type ChangeEvent,
} from "react";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { BackToHome } from "@/components/BackToHome";
import { useAuthModal } from "@/components/AuthModalProvider";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { resolveQuoteBackground } from "@/lib/quote-background";
import { FONT_OPTIONS, PALETTE_PRESETS, getCardPaletteStyle } from "@/lib/quote-presets";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import { cn } from "@/lib/cn";

const DRAFT_KEY = "slabpixel-submit-draft";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const TARGET_OUTPUT_BYTES = 2 * 1024 * 1024;

async function compressBackgroundImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Image compression is not supported in this browser");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.86;
  let blob: Blob | null = null;
  for (let i = 0; i < 5; i++) {
    blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", quality),
    );
    if (!blob) break;
    if (blob.size <= TARGET_OUTPUT_BYTES || quality <= 0.5) break;
    quality -= 0.1;
  }

  if (!blob) return file;
  const baseName = file.name.replace(/\.[^/.]+$/, "");
  return new File([blob], `${baseName || "background"}.webp`, {
    type: "image/webp",
  });
}

// ── Submit Page ──────────────────────────────────────────────

export default function SubmitPage() {
  const { data: session } = useSession();

  const [text, setText] = useState("");
  const [attribution, setAttribution] = useState("");
  const [fontPrimary, setFontPrimary] = useState<string | null>(null);
  const [selectedPalette, setSelectedPalette] = useState<number | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    null,
  );
  const [backgroundUploadUrl, setBackgroundUploadUrl] = useState<string | null>(
    null,
  );
  const [backgroundUploading, setBackgroundUploading] = useState(false);
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, ""])),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { openAuthModal } = useAuthModal();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);
  const didAutoFill = useRef(false);

  // Auto-fill attribution from session
  useEffect(() => {
    if (session?.user?.name && !didAutoFill.current) {
      setAttribution(session.user.name);
      didAutoFill.current = true;
    }
  }, [session?.user?.name]);

  // Restore draft from localStorage after OAuth redirect
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.text) setText(draft.text);
        if (draft.attribution) setAttribution(draft.attribution);
        if (draft.fontPrimary) setFontPrimary(draft.fontPrimary);
        if (draft.selectedPalette !== undefined)
          setSelectedPalette(draft.selectedPalette);
        if (draft.selectedBackground)
          setSelectedBackground(draft.selectedBackground);
        if (draft.backgroundUploadUrl)
          setBackgroundUploadUrl(draft.backgroundUploadUrl);
        if (draft.socialHandles) setSocialHandles(draft.socialHandles);
        didAutoFill.current = true;
      } catch {
        /* ignore malformed draft */
      }
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  // Load all Google Fonts for the option buttons
  useEffect(() => {
    FONT_OPTIONS.filter((f) => f.google).forEach((f) => {
      const id = `gfont-${f.value.replace(/\s+/g, "-")}`;
      if (document.getElementById(id)) return;
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.value)}:wght@200;300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    });
  }, []);

  // Auto-resize the card textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [text]);

  const saveDraftBeforeGoogleSignIn = () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        text,
        attribution,
        fontPrimary,
        selectedPalette,
        selectedBackground,
        backgroundUploadUrl,
        socialHandles,
      }),
    );
  };

  const handleBackgroundFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setError("Image must be 5MB or smaller before upload.");
      return;
    }

    if (!session) {
      openAuthModal({
        callbackURL: "/submit",
        onBeforeGoogleSignIn: saveDraftBeforeGoogleSignIn,
      });
      setError("Sign in to upload a custom background.");
      return;
    }

    setBackgroundUploading(true);
    setError(null);
    try {
      const prepared = await compressBackgroundImage(file);
      if (prepared.size > MAX_UPLOAD_BYTES) {
        throw new Error(
          "Image is still too large after compression. Please choose a smaller image.",
        );
      }
      const fd = new FormData();
      fd.append("file", prepared);
      const res = await fetch("/api/uploads/background", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          typeof data.error === "string" ? data.error : "Upload failed",
        );
      }
      if (typeof data.url !== "string") {
        throw new Error("Invalid upload response");
      }
      setSelectedBackground(null);
      setBackgroundUploadUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBackgroundUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim() || !attribution.trim()) return;

    if (!session) {
      openAuthModal({
        callbackURL: "/submit",
        onBeforeGoogleSignIn: saveDraftBeforeGoogleSignIn,
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const handles = Object.entries(socialHandles)
        .filter(([, v]) => v.trim())
        .map(([platformKey, handle]) => {
          const config = SOCIAL_PLATFORMS.find((p) => p.key === platformKey);
          const clean = handle.replace(/^@/, "");
          return config ? `${config.urlPrefix}${clean}` : handle;
        });

      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          attribution: attribution.trim(),
          socialHandles: handles,
          fontPrimary,
          colorPalette:
            selectedPalette !== null
              ? JSON.stringify(PALETTE_PRESETS[selectedPalette].colors)
              : null,
          backgroundId: selectedBackground,
          backgroundUrl: backgroundUploadUrl,
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

  const bgPreview = resolveQuoteBackground({
    backgroundUrl: backgroundUploadUrl,
    backgroundId: selectedBackground,
  });

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <BackToHome />
        <div className="text-center space-y-6 px-6">
          <div className="text-5xl text-foreground">&#x2713;</div>
          <h1 className="text-2xl font-light text-foreground tracking-tight">
            Quote Submitted
          </h1>
          <p className="text-foreground/50 max-w-md">
            Your quote has been submitted for review. Our team will curate it
            and, if approved, transform it into a visual artifact.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <BackToHome />
            <Link
              href="/explore"
              className="px-6 py-3 text-sm font-medium text-foreground border border-border rounded-full hover:bg-foreground/5 transition-colors"
            >
              Back to Grid
            </Link>
            <Link
              href="/your-quotes"
              className="px-6 py-3 text-sm font-medium text-background bg-foreground rounded-full hover:bg-foreground/90 transition-colors"
            >
              My Submissions
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <BackToHome />
      {/* ── Left (desktop) / Top (mobile): Sticky Preview ───────────────────── */}
      <div className="sticky top-0 z-10 h-[calc(42vh+4rem)] min-h-[320px] w-full shrink-0 overflow-hidden bg-background p-2 pt-16 lg:h-screen lg:min-h-0 lg:w-1/2 lg:pt-2">
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl lg:rounded-4xl">
          {bgPreview.type !== "none" ? (
            <>
              <Image
                src={bgPreview.src}
                alt={bgPreview.label ?? "Background"}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/22" />
            </>
          ) : (
            <div className="absolute inset-0 bg-[#ebebeb]" />
          )}

          <div
            className="relative z-10 mx-3 flex w-full max-w-97 flex-col justify-between gap-4 rounded-2xl bg-card-bg text-card-text p-4 min-h-52 max-lg:gap-3 max-lg:min-h-52 lg:mx-8 lg:min-h-69 lg:rounded-4xl lg:p-6"
            style={{
              ...getCardPaletteStyle(
                {
                  colorPalette:
                    selectedPalette !== null
                      ? JSON.stringify(PALETTE_PRESETS[selectedPalette].colors)
                      : null,
                },
                0,
              ),
              fontFamily: fontPrimary
                ? `"${fontPrimary}", serif`
                : undefined,
            }}
          >
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Your quotes will appear here..."
                maxLength={500}
                rows={1}
                className="w-full bg-transparent scrollbar-hide border-0 outline-none resize-none text-lg font-medium leading-relaxed placeholder:text-card-muted/70 p-0 max-lg:text-base"
              />
              <input
                value={attribution}
                onChange={(e) => setAttribution(e.target.value)}
                placeholder="Your name"
                maxLength={100}
                className="w-full bg-transparent border-0 outline-none text-sm text-card-muted placeholder:text-card-muted/70 p-0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Scrollable Options (desktop) / below preview (mobile) ─────── */}
      <div className="w-full overflow-y-auto lg:w-1/2">
        <div className="mx-auto max-w-xl space-y-10 px-12 pb-16 pt-28 max-lg:space-y-8 max-lg:px-4 max-lg:pt-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground max-lg:text-2xl">
              Submit a Quote
            </h1>
            <p className="text-foreground/50 mt-2 text-sm">
              Share words that matter. Shape how they look and feel.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Font Styles */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">Font Styles</h3>
            <div className="flex flex-wrap gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() =>
                    setFontPrimary(fontPrimary === f.value ? null : f.value)
                  }
                  className={cn(
                    "px-4 py-2 text-sm rounded-lg border transition-all cursor-pointer",
                    fontPrimary === f.value
                      ? "border-foreground bg-foreground text-white"
                      : "border-border text-foreground hover:border-foreground/30",
                  )}
                  style={{ fontFamily: `"${f.value}", serif` }}
                >
                  {f.display}
                </button>
              ))}
            </div>
          </section>

          {/* Color Theme */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">Color Theme</h3>
            <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-lg:gap-2">
              {PALETTE_PRESETS.map((p, idx) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setSelectedPalette(selectedPalette === idx ? null : idx)
                  }
                  className={cn(
                    "flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all cursor-pointer",
                    selectedPalette === idx
                      ? "border-foreground"
                      : "border-border hover:border-foreground/20",
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    {p.colors.map((c, ci) => (
                      <div
                        key={ci}
                        className={cn(
                          "rounded-full border border-black/5",
                          ci === 0 ? "w-6 h-6" : "w-5 h-5",
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-foreground/50">{p.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Background Theme */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">
              Background Theme
            </h3>
            <input
              ref={backgroundFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBackgroundFile}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                disabled={backgroundUploading}
                onClick={() => backgroundFileInputRef.current?.click()}
                className={cn(
                  "px-4 py-2 text-sm rounded-lg border transition-all cursor-pointer",
                  backgroundUploadUrl
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-foreground hover:border-foreground/30",
                  backgroundUploading && "opacity-50 cursor-not-allowed",
                )}
              >
                {backgroundUploading
                  ? "Uploading…"
                  : backgroundUploadUrl
                    ? "Custom image selected"
                    : "Upload your own"}
              </button>
              {backgroundUploadUrl && (
                <button
                  type="button"
                  onClick={() => setBackgroundUploadUrl(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-border text-foreground/70 hover:text-foreground"
                >
                  Remove upload
                </button>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-lg:gap-2">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    setBackgroundUploadUrl(null);
                    setSelectedBackground(
                      selectedBackground === b.id ? null : b.id,
                    );
                  }}
                  className={cn(
                    "aspect-square rounded-xl border-2 overflow-hidden bg-[#f5f5f5] transition-all cursor-pointer relative",
                    selectedBackground === b.id && !backgroundUploadUrl
                      ? "border-foreground"
                      : "border-transparent hover:border-foreground/20",
                  )}
                >
                  <Image
                    src={b.src}
                    alt={b.label}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Social Media */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">Social Media</h3>
            <div className="flex flex-col gap-3">
              {SOCIAL_PLATFORMS.map((platform) => (
                <div
                  key={platform.key}
                  className={cn(
                    "flex items-center gap-3 border rounded-xl px-4 py-3 transition-colors",
                    socialHandles[platform.key]?.trim()
                      ? "border-foreground/20"
                      : "border-border",
                  )}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 shrink-0 text-foreground/40"
                    fill="currentColor"
                  >
                    <path d={platform.iconPath} />
                  </svg>
                  <input
                    value={socialHandles[platform.key]}
                    onChange={(e) =>
                      setSocialHandles((prev) => ({
                        ...prev,
                        [platform.key]: e.target.value,
                      }))
                    }
                    placeholder={platform.placeholder}
                    maxLength={200}
                    className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-foreground/30"
                  />
                  {socialHandles[platform.key]?.trim() && (
                    <svg
                      className="w-5 h-5 shrink-0 text-foreground/40"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !text.trim() || !attribution.trim()}
            className="w-full py-4 bg-foreground text-background font-medium text-sm rounded-full hover:bg-foreground/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path
                d="M1.42188 10.5273C0.519531 9.43359 0 8.03906 0 6.5625C0 2.95312 3.14453 0 7 0C10.8555 0 14 2.95312 14 6.5625C14 10.1992 10.8555 13.125 7 13.125C6.01562 13.125 5.05859 12.9336 4.18359 12.5781L1.01172 13.9453C0.902344 14 0.820312 14 0.710938 14C0.300781 14 0 13.6992 0 13.3164C0 13.1797 0.0273438 13.0703 0.0820312 12.9609L1.42188 10.5273ZM2.43359 9.70703C2.76172 10.1172 2.81641 10.6914 2.57031 11.1562L2.07812 12.0586L3.69141 11.375C3.99219 11.2383 4.375 11.2383 4.70312 11.375C5.38672 11.6484 6.17969 11.8125 7 11.8125C10.2266 11.8125 12.6875 9.37891 12.6875 6.5625C12.6875 3.74609 10.2266 1.3125 7 1.3125C3.77344 1.3125 1.3125 3.74609 1.3125 6.5625C1.3125 7.73828 1.72266 8.80469 2.43359 9.70703Z"
                fill="currentColor"
              />
            </svg>
            {isSubmitting ? "Submitting..." : "Submit a Quotes"}
          </button>
        </div>
      </div>

    </div>
  );
}

