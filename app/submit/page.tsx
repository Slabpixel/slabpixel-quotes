"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSession, signIn, signUp } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { BACKGROUNDS } from "@/lib/backgrounds";
import { cn } from "@/lib/cn";

const FONT_OPTIONS = [
  { display: "Playfair Display", value: "Playfair Display", google: true },
  { display: "Switzer", value: "Switzer", google: false },
  { display: "Times New Roman", value: "Times New Roman", google: false },
  { display: "Comic Sans", value: "Comic Sans MS", google: false },
  { display: "Lato", value: "Lato", google: true },
  { display: "Space Grotesk", value: "Space Grotesk", google: true },
  { display: "Inter Display", value: "Inter", google: true },
  { display: "Aonton", value: "Anton", google: true },
  { display: "Brawler", value: "Brawler", google: true },
];

const PALETTE_PRESETS = [
  { name: "Light", colors: ["#1a1a1a", "#666666", "#d9d9d9", "#f0f0f0"] },
  { name: "Dark", colors: ["#1a1a1a", "#555555", "#aaaaaa", "#d9d9d9"] },
  { name: "Midnight", colors: ["#0d1b2e", "#415a77", "#778da9", "#e0e1dd"] },
  { name: "Earth", colors: ["#2d2d2d", "#8b4513", "#d4a574", "#f5f5dc"] },
  { name: "Berry", colors: ["#1a1a1a", "#c44569", "#ff6b6b", "#fefefe"] },
  { name: "Noir", colors: ["#111111", "#444444", "#ededed", "#ffffff"] },
];

const SOCIAL_PLATFORMS = [
  {
    key: "instagram",
    placeholder: "@yourusername",
    urlPrefix: "https://www.instagram.com/",
    iconPath:
      "M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077",
  },
  {
    key: "twitter",
    placeholder: "@yourusername",
    urlPrefix: "https://x.com/",
    iconPath:
      "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  },
  {
    key: "facebook",
    placeholder: "@yourusername",
    urlPrefix: "https://www.facebook.com/",
    iconPath:
      "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  {
    key: "tiktok",
    placeholder: "@yourusername",
    urlPrefix: "https://www.tiktok.com/@",
    iconPath:
      "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  },
];

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
  const [socialHandles, setSocialHandles] = useState<Record<string, string>>({
    instagram: "",
    twitter: "",
    facebook: "",
    tiktok: "",
  });

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
        <div className="text-center space-y-6 px-6">
          <div className="text-5xl text-foreground">&#x2713;</div>
          <h1 className="text-2xl font-light text-foreground tracking-tight">
            Quote Submitted
          </h1>
          <p className="text-foreground/50 max-w-md">
            Your quote has been submitted for review. Our team will curate it
            and, if approved, transform it into a visual artifact.
          </p>
          <div className="flex gap-4 justify-center pt-4">
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
    <div className="flex min-h-screen">
      {/* ── Left: Sticky Preview ─────────────────────────── */}
      <div className="w-1/2 h-screen sticky top-0 flex items-center justify-center overflow-hidden">
        {bg ? (
          <>
            <Image
              src={bg.src}
              alt={bg.label}
              fill
              className="object-cover"
              sizes="50vw"
            />
            <div className="absolute inset-0 bg-black/22" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[#ebebeb]" />
        )}

        <div
          className="relative z-10 bg-white rounded-4xl p-6 max-w-97 w-full min-h-69 flex flex-col justify-between gap-4 mx-8"
          style={{
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
              className="w-full bg-transparent border-0 outline-none resize-none text-lg font-medium leading-relaxed text-foreground placeholder:text-foreground/30 p-0"
            />
            <input
              value={attribution}
              onChange={(e) => setAttribution(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              className="w-full bg-transparent border-0 outline-none text-sm text-foreground/50 placeholder:text-foreground/25 p-0"
            />
          </div>
        </div>
      </div>

      {/* ── Right: Scrollable Options ────────────────────── */}
      <div className="w-1/2 overflow-y-auto">
        <div className="px-12 pt-28 pb-16 max-w-xl space-y-10">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight">
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
            <div className="grid grid-cols-3 gap-3">
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
            <div className="grid grid-cols-4 gap-3">
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
