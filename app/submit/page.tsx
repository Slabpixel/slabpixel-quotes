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
import { submitQuoteSchema } from "@/lib/validations/quote";
import { cn } from "@/lib/cn";

const DRAFT_KEY = "slabpixel-submit-draft";
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 1920;
const TARGET_OUTPUT_BYTES = 2 * 1024 * 1024;
type SubmitFieldErrors = {
  text?: string;
  attribution?: string;
  socialHandles?: string;
  consent?: string;
};
type BackgroundTab = "solid" | "image" | "upload";

function mapSubmitFieldErrors(
  source: Record<string, string[] | undefined> | undefined,
): SubmitFieldErrors {
  if (!source) return {};
  return {
    text: source.text?.[0],
    attribution: source.attribution?.[0],
    socialHandles: source.socialHandles?.[0],
  };
}

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
  const [backgroundTab, setBackgroundTab] = useState<BackgroundTab>("solid");
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
  const [agreedToLegal, setAgreedToLegal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<SubmitFieldErrors>({});
  const { openAuthModal } = useAuthModal();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backgroundFileInputRef = useRef<HTMLInputElement>(null);

  // Attribution is always synced to current account name.
  useEffect(() => {
    setAttribution(session?.user?.name ?? "");
  }, [session?.user?.name]);

  // Restore draft from localStorage after OAuth redirect
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.text) setText(draft.text);
        if (draft.fontPrimary) setFontPrimary(draft.fontPrimary);
        if (draft.selectedPalette !== undefined)
          setSelectedPalette(draft.selectedPalette);
        if (draft.selectedBackground)
          setSelectedBackground(draft.selectedBackground);
        if (draft.backgroundTab) setBackgroundTab(draft.backgroundTab);
        if (draft.backgroundUploadUrl)
          setBackgroundUploadUrl(draft.backgroundUploadUrl);
        if (draft.socialHandles) setSocialHandles(draft.socialHandles);
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
        fontPrimary,
        selectedPalette,
        selectedBackground,
        backgroundTab,
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
      setBackgroundTab("upload");
      setBackgroundUploadUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBackgroundUploading(false);
    }
  };

  const handleSubmit = async () => {
    const trimmedText = text.trim();
    const trimmedAttribution = attribution.trim();
    const handles = Object.entries(socialHandles)
      .filter(([, v]) => v.trim())
      .map(([platformKey, handle]) => {
        const config = SOCIAL_PLATFORMS.find((p) => p.key === platformKey);
        const clean = handle.replace(/^@/, "");
        return config ? `${config.urlPrefix}${clean}` : handle;
      });

    if (!session) {
      openAuthModal({
        callbackURL: "/submit",
        onBeforeGoogleSignIn: saveDraftBeforeGoogleSignIn,
      });
      setError("Please sign in before submitting your quote.");
      return;
    }

    const payload = {
      text: trimmedText,
      attribution: session.user.name?.trim() || trimmedAttribution,
      socialHandles: handles,
      fontPrimary,
      colorPalette:
        selectedPalette !== null
          ? JSON.stringify(PALETTE_PRESETS[selectedPalette].colors)
          : null,
      backgroundId: selectedBackground,
      backgroundUrl: backgroundUploadUrl,
    };

    const parsed = submitQuoteSchema.safeParse(payload);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      const nextFieldErrors = mapSubmitFieldErrors(
        flattened.fieldErrors as Record<string, string[] | undefined>,
      );
      setFieldErrors(nextFieldErrors);
      setError(
        parsed.error.issues[0]?.message ??
        "Please fix the highlighted fields and try again.",
      );
      return;
    }

    if (!agreedToLegal) {
      setFieldErrors((prev) => ({
        ...prev,
        consent: "You must agree to Terms and Privacy Policy before submitting.",
      }));
      return;
    }

    setFieldErrors({});

    setIsSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        const details = data?.details?.fieldErrors as
          | Record<string, string[]>
          | undefined;
        if (details) {
          setFieldErrors(mapSubmitFieldErrors(details));
        }
        throw new Error(
          data?.error ||
          "Failed to submit quote. Please check the form and try again.",
        );
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
  const solidBackgrounds = BACKGROUNDS.filter((b) => b.type === "solid");
  const imageBackgrounds = BACKGROUNDS.filter((b) => b.type === "image");

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
              href="/"
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
          {bgPreview.type === "preset" || bgPreview.type === "custom" ? (
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
          ) : bgPreview.type === "solid" ? (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: bgPreview.color }}
            />
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
                onChange={(e) => {
                  setText(e.target.value);
                  if (fieldErrors.text) {
                    setFieldErrors((prev) => ({ ...prev, text: undefined }));
                  }
                }}
                placeholder="Your quotes will appear here..."
                maxLength={500}
                rows={1}
                className="w-full bg-transparent scrollbar-hide border-0 outline-none resize-none text-lg font-medium leading-relaxed placeholder:text-card-muted/70 p-0 max-lg:text-base"
              />
              <input
                value={attribution}
                readOnly
                placeholder={session?.user?.name ?? "Name"}
                maxLength={100}
                className="w-full bg-transparent border-0 outline-none text-sm text-card-muted placeholder:text-card-muted/70 p-0"
              />
              {fieldErrors.text && (
                <p className="text-xs text-red-600">{fieldErrors.text}</p>
              )}
              {fieldErrors.attribution && (
                <p className="text-xs text-red-600">{fieldErrors.attribution}</p>
              )}
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

          {/* Card Theme */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">Card Theme</h3>
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
            <div className="inline-flex rounded-xl border border-border p-1 mb-4">
              {([
                ["solid", "Solid Color"],
                ["image", "Background Image"],
                ["upload", "Upload Image"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setBackgroundTab(key)}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer",
                    backgroundTab === key
                      ? "bg-foreground text-background"
                      : "text-foreground/60 hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              ref={backgroundFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleBackgroundFile}
            />
            {backgroundTab === "upload" && (
              <div className="mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={backgroundUploading}
                    onClick={() => backgroundFileInputRef.current?.click()}
                    className={cn(
                      "px-4 py-2 text-sm rounded-lg border transition-all cursor-pointer",
                      "border-border text-foreground hover:border-foreground/30",
                      backgroundUploading && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {backgroundUploading ? (
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="size-4 inline-block animate-spin rounded-full border-2 border-foreground/40 border-t-foreground"
                          aria-hidden
                        />
                        Uploading…
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden
                        >
                          <path
                            d="M12 16V4"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M7 9L12 4L17 9"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M20 16.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2.5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                        Upload
                      </span>
                    )}
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

                {backgroundUploadUrl && (
                  <div className="mt-3 relative w-full aspect-video rounded-xl border border-border overflow-hidden bg-[#f5f5f5]">
                    <Image
                      src={backgroundUploadUrl}
                      alt="Uploaded background preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                )}
              </div>
            )}
            {backgroundTab === "solid" && (
              <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-lg:gap-2">
                {solidBackgrounds.map((b) => (
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
                      "aspect-square rounded-xl border-2 overflow-hidden transition-all cursor-pointer relative",
                      selectedBackground === b.id && !backgroundUploadUrl
                        ? "border-foreground"
                        : "border-transparent hover:border-foreground/20",
                    )}
                    style={{ backgroundColor: b.color }}
                  />
                ))}
              </div>
            )}
            {backgroundTab === "image" && (
              <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-lg:gap-2">
                {imageBackgrounds.map((b) => (
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
                      src={b.src ?? "/backgrounds/abstract-01.jpg"}
                      alt={b.label}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Social Media */}
          <section>
            <h3 className="text-sm text-foreground/40 mb-4">Social Media</h3>
            {fieldErrors.socialHandles && (
              <p className="text-xs text-red-600 mb-2">
                {fieldErrors.socialHandles}
              </p>
            )}
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
          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm text-foreground/70">
              <input
                type="checkbox"
                checked={agreedToLegal}
                onChange={(e) => {
                  setAgreedToLegal(e.target.checked);
                  if (fieldErrors.consent) {
                    setFieldErrors((prev) => ({ ...prev, consent: undefined }));
                  }
                }}
                className="mt-0.5"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" className="underline">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {fieldErrors.consent && (
              <p className="text-xs text-red-600">{fieldErrors.consent}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              backgroundUploading ||
              !text.trim() ||
              !agreedToLegal
            }
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

