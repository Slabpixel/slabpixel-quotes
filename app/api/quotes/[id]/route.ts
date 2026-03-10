import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/quotes/[id] — get a single published quote
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: {
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
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Only return published quotes to the public
  if (quote.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json({ quote });
}
