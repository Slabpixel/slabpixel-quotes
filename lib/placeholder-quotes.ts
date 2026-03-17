/**
 * Placeholder quote data for development when the database is unavailable
 * or returns no results. Used by feed queries and by Home/Explore clients.
 */

import type { QuoteData } from "@/types/quote";

const now = new Date();
const dayAgo = new Date(now.getTime() - 86400000);
const twoDaysAgo = new Date(now.getTime() - 172800000);

export const PLACEHOLDER_QUOTES_FEED: QuoteData[] = [
  {
    id: "ph-1",
    text: "The best way to predict the future is to design it.",
    attribution: "Buckminster Fuller",
    socialHandles: [],
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Switzer",
    fontSecondary: "Inter",
    colorPalette: null,
    mood: "bold",
    cardImageUrl: null,
    publishedAt: now.toISOString(),
    submitter: { id: "s1", name: "Dianna", profilePhoto: null, image: null },
  },
  {
    id: "ph-2",
    text: "White space is to be regarded as an active element, not a passive background.",
    attribution: "Jan Tschichold",
    socialHandles: [],
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Cormorant Garamond",
    fontSecondary: "Source Sans Pro",
    colorPalette: null,
    mood: "serene",
    cardImageUrl: null,
    publishedAt: dayAgo.toISOString(),
    submitter: { id: "s2", name: "Robert", profilePhoto: null, image: null },
  },
  {
    id: "ph-3",
    text: "Good design is as little design as possible.",
    attribution: "Dieter Rams",
    socialHandles: [],
    authorPhoto: null,
    backgroundId: null,
    fontPrimary: "Space Grotesk",
    fontSecondary: "DM Sans",
    colorPalette: null,
    mood: "minimal",
    cardImageUrl: null,
    publishedAt: twoDaysAgo.toISOString(),
    submitter: null,
  },
];

/**
 * Use placeholder quotes in development when DB is not available.
 * Set USE_PLACEHOLDER_QUOTES=true to force placeholders in any environment.
 */
export function usePlaceholderQuotesInDev(): boolean {
  if (process.env.USE_PLACEHOLDER_QUOTES === "true") return true;
  return process.env.NODE_ENV === "development";
}
