/**
 * Shared quote queries and serialization.
 * Single place for Prisma select shapes and for normalizing JsonValue → string[] + date → string.
 */

import { prisma } from "@/lib/db";
import type { QuoteData } from "@/types/quote";

// ─── Serialization helpers ───────────────────────────────────────────────────

/** Normalize Prisma JsonValue (socialHandles) to string[] for client/API. */
export function normalizeSocialHandles(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

/** Serialize a quote for feed (home/explore): socialHandles + publishedAt. */
export function serializeQuoteForFeed<T extends { socialHandles?: unknown; publishedAt?: Date | null }>(
  q: T,
): Omit<T, "socialHandles" | "publishedAt"> & { socialHandles: string[]; publishedAt: string | null } {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    publishedAt: q.publishedAt?.toISOString() ?? null,
  };
}

/** Serialize a quote for your-quotes page: socialHandles + createdAt + publishedAt. */
export function serializeQuoteForYourQuotes<
  T extends { socialHandles?: unknown; createdAt: Date; publishedAt?: Date | null },
>(q: T) {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    createdAt: q.createdAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString() ?? null,
  };
}

/** Serialize a quote for dashboard: socialHandles + createdAt + updatedAt + publishedAt. */
export function serializeQuoteForDashboard<
  T extends {
    socialHandles?: unknown;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date | null;
  },
>(q: T) {
  return {
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString() ?? null,
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
  createdAt: true,
  publishedAt: true,
} as const;

export const quoteSelectForApiList = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
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
      image: true,
    },
  },
} as const;

export const quoteSelectForApiDetail = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
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

export type QuoteForFeed = Awaited<
  ReturnType<typeof prisma.quote.findMany<{ select: typeof quoteSelectForFeed }>>
>[number];

/** Fetch published quotes for home/explore feed. Returns serialized QuoteData[]. */
export async function getPublishedQuotesForFeed(limit = 50): Promise<QuoteData[]> {
  const quotes = await prisma.quote.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    take: limit,
    select: quoteSelectForFeed,
  });
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
