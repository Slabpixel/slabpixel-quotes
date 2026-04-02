/**
 * Shared quote queries and serialization.
 * Single place for Prisma select shapes and for normalizing JsonValue → string[] + date → string.
 */

import { prisma } from "@/lib/db";
import { unstable_cache } from "next/cache";
import type { QuoteData } from "@/types/quote";

// ─── Serialization helpers ───────────────────────────────────────────────────

/** Normalize Prisma JsonValue (socialHandles) to string[] for client/API. */
export function normalizeSocialHandles(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/**
 * Dates from Prisma are `Date`; after `unstable_cache` hits they deserialize as ISO strings.
 */
export function serializeDateToIso(value: unknown): string | null {
  if (value == null) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  return null;
}

function serializeRequiredDate(value: unknown, field: string): string {
  const s = serializeDateToIso(value);
  if (s == null) throw new TypeError(`Invalid or missing date: ${field}`);
  return s;
}

type DateLike = Date | string | null | undefined;

/** Serialize a quote for the public feed: socialHandles + publishedAt. */
export function serializeQuoteForFeed<T extends { socialHandles?: unknown; publishedAt?: DateLike }>(
  q: T,
): Omit<T, "socialHandles" | "publishedAt"> & { socialHandles: string[]; publishedAt: string | null } {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    publishedAt: serializeDateToIso(q.publishedAt),
  };
}

/** Serialize a quote for your-quotes page: socialHandles + createdAt + publishedAt. */
export function serializeQuoteForYourQuotes<
  T extends { socialHandles?: unknown; createdAt: DateLike; publishedAt?: DateLike },
>(q: T) {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    createdAt: serializeRequiredDate(q.createdAt, "createdAt"),
    publishedAt: serializeDateToIso(q.publishedAt),
  };
}

/** Serialize a quote for dashboard: socialHandles + createdAt + updatedAt + publishedAt. */
export function serializeQuoteForDashboard<
  T extends {
    socialHandles?: unknown;
    createdAt: DateLike;
    updatedAt: DateLike;
    publishedAt?: DateLike;
  },
>(q: T) {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    createdAt: serializeRequiredDate(q.createdAt, "createdAt"),
    updatedAt: serializeRequiredDate(q.updatedAt, "updatedAt"),
    publishedAt: serializeDateToIso(q.publishedAt),
  };
}

// ─── Select shapes (reusable across pages and API routes) ─────────────────────

export const quoteSelectForFeed = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
  backgroundId: true,
  backgroundUrl: true,
  fontPrimary: true,
  fontSecondary: true,
  colorPalette: true,
  mood: true,
  cardImageUrl: true,
  publishedAt: true,
  submitter: {
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      image: true,
    },
  },
} as const;

export const quoteSelectForYourQuotes = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  status: true,
  mood: true,
  colorPalette: true,
  backgroundId: true,
  backgroundUrl: true,
  createdAt: true,
  publishedAt: true,
} as const;

export const quoteSelectForApiList = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
  backgroundId: true,
  backgroundUrl: true,
  fontPrimary: true,
  fontSecondary: true,
  colorPalette: true,
  mood: true,
  cardImageUrl: true,
  publishedAt: true,
  submitter: {
    select: {
      id: true,
      name: true,
      profilePhoto: true,
      image: true,
    },
  },
} as const;

export const quoteSelectForProfileDrafts = {
  ...quoteSelectForApiList,
  status: true,
} as const;

export const quoteSelectForApiDetail = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
  backgroundId: true,
  backgroundUrl: true,
  fontPrimary: true,
  fontSecondary: true,
  colorPalette: true,
  mood: true,
  cardImageUrl: true,
  publishedAt: true,
  createdAt: true,
  status: true,
  submitter: {
    select: {
      id: true,
      name: true,
      image: true,
    },
  },
} as const;

// ─── Query helpers (server-only: used in pages and API routes) ─────────────────
export const PUBLISHED_QUOTES_FEED_TAG = "published-quotes-feed";
const PUBLISHED_QUOTES_FEED_REVALIDATE_SECONDS = 60;

export type QuoteForFeed = Awaited<
  ReturnType<typeof prisma.quote.findMany<{ select: typeof quoteSelectForFeed }>>
>[number];

/** Fetch published quotes for the public feed. Returns serialized QuoteData[]. */
export async function getPublishedQuotesForFeed(limit = 24): Promise<QuoteData[]> {
  const cachedQuery = unstable_cache(
    async () =>
      prisma.quote.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: quoteSelectForFeed,
      }),
    ["published-quotes-feed", String(limit)],
    {
      revalidate: PUBLISHED_QUOTES_FEED_REVALIDATE_SECONDS,
      tags: [PUBLISHED_QUOTES_FEED_TAG],
    },
  );
  const quotes = await cachedQuery();
  return quotes.map(serializeQuoteForFeed);
}

/** Fetch current user's quotes for your-quotes page. Returns serialized list. */
export async function getUserQuotesForYourQuotes(userId: string) {
  const quotes = await prisma.quote.findMany({
    where: { submitterId: userId },
    orderBy: { createdAt: "desc" },
    select: quoteSelectForYourQuotes,
  });
  return quotes.map(serializeQuoteForYourQuotes);
}

/** Quote stats for dashboard. */
export async function getQuoteStats() {
  const [total, pending, inReview, approved, published, rejected] =
    await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "PENDING" } }),
      prisma.quote.count({ where: { status: "IN_REVIEW" } }),
      prisma.quote.count({ where: { status: "APPROVED" } }),
      prisma.quote.count({ where: { status: "PUBLISHED" } }),
      prisma.quote.count({ where: { status: "REJECTED" } }),
    ]);
  return { total, pending, inReview, approved, published, rejected };
}

/** Fetch published quotes by submitter (for public profile). */
export async function getPublishedQuotesByUser(userId: string): Promise<QuoteData[]> {
  const quotes = await prisma.quote.findMany({
    where: { submitterId: userId, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: quoteSelectForFeed,
  });
  return quotes.map(serializeQuoteForFeed);
}

/** Fetch drafts (non-published) for the profile draft preview. */
export async function getDraftQuotesByUserForProfile(
  userId: string,
): Promise<QuoteData[]> {
  const quotes = await prisma.quote.findMany({
    where: { submitterId: userId, status: { not: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    select: quoteSelectForProfileDrafts,
  });
  return quotes.map(serializeQuoteForFeed);
}

/** Fetch all quotes + stats for dashboard (admin). */
export async function getDashboardQuotesWithStats() {
  const [quotes, stats] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submitter: {
          select: { id: true, name: true, email: true, image: true },
        },
        curator: {
          select: { id: true, name: true },
        },
      },
    }),
    getQuoteStats(),
  ]);
  const serialized = quotes.map(serializeQuoteForDashboard);
  return { quotes: serialized, stats };
}
