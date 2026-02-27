import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { submitQuoteSchema } from "@/lib/validations/quote";
import { headers } from "next/headers";

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
      select: {
        id: true,
        text: true,
        attribution: true,
        socialHandle: true,
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
      },
    }),
    prisma.quote.count({ where }),
  ]);

  return NextResponse.json({
    quotes,
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

  const quote = await prisma.quote.create({
    data: {
      text: data.text,
      attribution: data.attribution,
      socialHandle: data.socialHandle ?? null,
      authorPhoto: data.authorPhoto ?? null,
      fontPrimary: data.fontPrimary ?? null,
      fontSecondary: data.fontSecondary ?? null,
      colorPalette: data.colorPalette ?? null,
      mood: data.mood ?? null,
      submitterId: session?.user?.id ?? null,
      status: "PENDING",
    },
  });

  return NextResponse.json({ quote }, { status: 201 });
}
