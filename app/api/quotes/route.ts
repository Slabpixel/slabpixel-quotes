import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitQuoteSchema } from "@/lib/validations/quote";
import { headers } from "next/headers";
import {
  quoteSelectForApiList,
  normalizeSocialHandles,
} from "@/lib/queries/quote";

// GET /api/quotes — list published quotes (public)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);
  const mood = searchParams.get("mood");

  const where = {
    status: "PUBLISHED" as const,
    ...(mood ? { mood } : {}),
  };

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: quoteSelectForApiList,
    }),
    prisma.quote.count({ where }),
  ]);

  const serialized = quotes.map((q) => ({
    ...q,
    socialHandles: normalizeSocialHandles(q.socialHandles),
    publishedAt: q.publishedAt?.toISOString() ?? null,
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

// POST /api/quotes — submit a new quote
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const body = await request.json();
  const result = submitQuoteSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 },
    );
  }

  const data = result.data;

  const backgroundUrl =
    data.backgroundUrl?.trim() ? data.backgroundUrl.trim() : null;

  const quote = await prisma.quote.create({
    data: {
      text: data.text,
      attribution: session?.user?.name?.trim() || data.attribution,
      socialHandles: data.socialHandles?.length ? data.socialHandles : [],
      authorPhoto: data.authorPhoto ?? null,
      fontPrimary: data.fontPrimary ?? null,
      fontSecondary: data.fontSecondary ?? null,
      colorPalette: data.colorPalette ?? null,
      mood: data.mood ?? null,
      backgroundId: data.backgroundId ?? null,
      backgroundUrl,
      submitterId: session?.user?.id ?? null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ quote }, { status: 201 });
}
