"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSession, signIn, signUp } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { BackToHome } from "@/components/BackToHome";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { FONT_OPTIONS, PALETTE_PRESETS, getCardPaletteStyle } from "@/lib/quote-presets";
import { SOCIAL_PLATFORMS } from "@/lib/social";
import { cn } from "@/lib/cn";

const DRAFT_KEY = "slabpixel-submit-draft";

// ── Login Modal ──────────────────────────────────────────────

function LoginModal({
  open,
  onClose,
  onGoogleSignIn,
}: {
  open: boolean;
  onClose: () => void;
  onGoogleSignIn: () => void;
}) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const result = await signIn.email({ email, password });
        if (result.error) throw new Error(result.error.message);
      } else {
        const result = await signUp.email({
          email,
          password,
          name: name || email.split("@")[0],
        });
        if (result.error) throw new Error(result.error.message);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground">Sign in</h2>
          <p className="text-sm text-foreground/50 mt-1">
            Sign in to create your quotes
          </p>
        </div>

        <button
          type="button"
          onClick={onGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-foreground px-4 py-3.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors cursor-pointer"
        >
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center shrink-0">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          </div>
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-foreground/40">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm text-foreground/60 mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/30"
              />
            </div>
          )}

          <div>
            <label className="block text-sm text-foreground/60 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Your email address"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/30"
            />
          </div>

          <div>
            <label className="block text-sm text-foreground/60 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Your password"
              className="w-full border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-foreground/30 transition-colors placeholder:text-foreground/30"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-foreground text-background text-sm font-medium rounded-xl hover:bg-foreground/90 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/50 mt-5">
          {mode === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-foreground font-medium underline cursor-pointer bg-transparent border-0"
              >
                Create Account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="text-foreground font-medium underline cursor-pointer bg-transparent border-0"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
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
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, ""])),
  );

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
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

  const saveDraftAndGoogleSignIn = () => {
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        text,
        attribution,
        fontPrimary,
        selectedPalette,
        selectedBackground,
        socialHandles,
      }),
    );
    signIn.social({ provider: "google", callbackURL: "/submit" });
  };

  const handleSubmit = async () => {
    if (!text.trim() || !attribution.trim()) return;

    if (!session) {
      setShowLoginModal(true);
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

  const bg = selectedBackground
    ? BACKGROUNDS.find((b) => b.id === selectedBackground)
    : null;

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
          {bg ? (
            <>
              <Image
                src={bg.src}
                alt={bg.label}
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
            <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-3 max-lg:gap-2">
              {BACKGROUNDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() =>
                    setSelectedBackground(
                      selectedBackground === b.id ? null : b.id,
                    )
                  }
                  className={cn(
                    "aspect-square rounded-xl border-2 overflow-hidden bg-[#f5f5f5] transition-all cursor-pointer relative",
                    selectedBackground === b.id
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

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onGoogleSignIn={saveDraftAndGoogleSignIn}
      />
    </div>
  );
}

