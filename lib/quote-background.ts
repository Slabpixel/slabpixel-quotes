import { getBackground } from "@/lib/backgrounds";

export type ResolvedQuoteBackground =
  | { type: "custom"; src: string; label?: string }
  | { type: "preset"; src: string; label: string }
  | { type: "none" };

/**
 * Resolve which background image to show for a quote.
 * Custom upload (`backgroundUrl`) wins; otherwise preset `backgroundId`.
 */
export function resolveQuoteBackground(quote: {
  backgroundUrl?: string | null;
  backgroundId?: string | null;
}): ResolvedQuoteBackground {
  const url = quote.backgroundUrl?.trim();
  if (url) {
    return { type: "custom", src: url, label: "Custom background" };
  }
  const preset = getBackground(quote.backgroundId ?? null);
  if (preset) {
    return { type: "preset", src: preset.src, label: preset.label };
  }
  return { type: "none" };
}
