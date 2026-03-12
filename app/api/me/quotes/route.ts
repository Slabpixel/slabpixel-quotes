import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { normalizeSocialHandles } from "@/lib/queries/quote";

const quoteSelectForMe = {
  id: true,
  text: true,
  attribution: true,
  socialHandles: true,
  authorPhoto: true,
  fontPrimary: true,
  fontSecondary: true,
  colorPalette: true,
  mood: true,
  status: true,
  cardImageUrl: true,
  publishedAt: true,
  createdAt: true,
} as const;

// GET /api/me/quotes — list the current user's submitted quotes
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  const where = { submitterId: session.user.id };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: quoteSelectForMe,
    }),
    prisma.quote.count({ where }),
  ]);

  const serialized = quotes.map((q) => ({
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    publishedAt: q.publishedAt?.toISOString() ?? null,
    createdAt: q.createdAt.toISOString(),
  }));

  return NextResponse.json({
    quotes: serialized,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
