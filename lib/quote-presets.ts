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
// Format: [bg, accent, text, muted] — used for card background, accent, main text, muted text

export interface PalettePreset {
  name: string;
  colors: [string, string, string, string];
}

export const PALETTE_PRESETS: PalettePreset[] = [
  { name: "Slate", colors: ["#1a1a2e", "#e94560", "#f0f0f0", "#999999"] },
  { name: "Ocean", colors: ["#0d1b2a", "#66d9ef", "#e0e1dd", "#415a77"] },
  { name: "Earth", colors: ["#2d2d2d", "#f5c842", "#f5f5f0", "#8b7a3a"] },
  { name: "Rose", colors: ["#1b1b2f", "#e43f5a", "#f0f0f0", "#7a7a9a"] },
  { name: "Teal", colors: ["#0b0c10", "#66fcf1", "#e8e8e8", "#45a29e"] },
  { name: "Berry", colors: ["#1a1a1a", "#ff6b6b", "#fefefe", "#c44569"] },
  { name: "Violet", colors: ["#16213e", "#a78bfa", "#eef0ff", "#533483"] },
  { name: "Coral", colors: ["#2c003e", "#d72631", "#f5f5f5", "#a2d5c6"] },
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
