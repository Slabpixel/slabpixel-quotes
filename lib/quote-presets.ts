import type { CSSProperties } from "react";

/**
 * Shared quote customization presets.
 * Used by: submit page, QuoteCard, card-renderer, and any UI that shows font/palette/mood options.
 */

// ─── Font options (submit form + any font picker) ───────────────────────────

export interface FontOption {
  /** Label shown in UI */
  display: string;
  /** CSS font-family value */
  value: string;
  /** If true, load from Google Fonts */
  google: boolean;
}

export const FONT_OPTIONS: FontOption[] = [
  { display: "Playfair Display", value: "Playfair Display", google: true },
  { display: "Switzer", value: "Switzer", google: false },
  { display: "Times New Roman", value: "Times New Roman", google: false },
  { display: "Comic Sans", value: "Comic Sans MS", google: false },
  { display: "Lato", value: "Lato", google: true },
  { display: "Space Grotesk", value: "Space Grotesk", google: true },
  { display: "Inter Display", value: "Inter", google: true },
  { display: "Anton", value: "Anton", google: true },
  { display: "Brawler", value: "Brawler", google: true },
];

// ─── Color palette presets ──────────────────────────────────────────────────
// Format: [bg, accent, text, muted] — light bg, dark text/muted for contrast (WCAG-friendly)

export interface PalettePreset {
  name: string;
  colors: [string, string, string, string];
}

export const PALETTE_PRESETS: PalettePreset[] = [
  { name: "Slate", colors: ["#f5f5f5", "#c62828", "#1a1a1a", "#424242"] },
  { name: "Ocean", colors: ["#e3f2fd", "#0277bd", "#0d47a1", "#455a64"] },
  { name: "Earth", colors: ["#faf6f0", "#bf360c", "#3e2723", "#5d4037"] },
  { name: "Rose", colors: ["#fce4ec", "#c2185b", "#880e4f", "#ad1457"] },
  { name: "Teal", colors: ["#e0f2f1", "#00695c", "#004d40", "#00695c"] },
  { name: "Berry", colors: ["#ffebee", "#b71c1c", "#1a1a1a", "#8e0038"] },
  { name: "Violet", colors: ["#ede7f6", "#512da8", "#311b92", "#5e35b1"] },
  { name: "Coral", colors: ["#fff3e0", "#e65100", "#bf360c", "#e65100"] },
];

/** Raw color arrays for fallback when quote has no custom palette (same order as PALETTE_PRESETS). */
export const DEFAULT_PALETTES: [string, string, string, string][] =
  PALETTE_PRESETS.map((p) => p.colors);

/**
 * Resolve palette for a quote: use stored colorPalette if valid, otherwise cycle through presets by index.
 */
export function getPaletteForQuote(
  quote: { colorPalette?: string | null },
  index: number,
): string[] {
  if (quote.colorPalette) {
    try {
      const parsed = JSON.parse(quote.colorPalette);
      if (Array.isArray(parsed) && parsed.length >= 4) return parsed;
    } catch {
      // fall through
    }
  }
  return DEFAULT_PALETTES[index % DEFAULT_PALETTES.length];
}

const CARD_PALETTE_FALLBACKS = ["#f5f5f5", "#c62828", "#1a1a1a", "#424242"] as const;

/**
 * Returns a React style object that sets card palette CSS variables for a quote.
 * Use on the card container so children can use Tailwind classes bg-card-bg, text-card-accent, etc.
 * Also sets --accent and --text for backward compatibility with existing mood CSS.
 */
export function getCardPaletteStyle(
  quote: { colorPalette?: string | null },
  index: number,
): CSSProperties {
  const palette = getPaletteForQuote(quote, index);
  const [bg, accent, text, muted] = palette.map((c, i) => c || CARD_PALETTE_FALLBACKS[i]);
  return {
    "--card-bg": bg,
    "--card-accent": accent,
    "--card-text": text,
    "--card-muted": muted,
    "--accent": accent,
    "--text": text,
  } as CSSProperties;
}

// ─── Mood options (for any mood selector; matches seed + CSS classes) ──────────

export const MOOD_OPTIONS = [
  "bold",
  "serene",
  "melancholy",
  "minimal",
  "playful",
  "intense",
  "dreamy",
  "raw",
] as const;

export type MoodOption = (typeof MOOD_OPTIONS)[number];
