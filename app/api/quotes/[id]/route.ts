import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  quoteSelectForApiDetail,
  normalizeSocialHandles,
} from "@/lib/queries/quote";

// GET /api/quotes/[id] — get a single published quote
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    select: quoteSelectForApiDetail,
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  if (quote.status !== "PUBLISHED") {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const serialized = {
    ...quote,
    socialHandles: normalizeSocialHandles(quote.socialHandles),
    publishedAt: quote.publishedAt?.toISOString() ?? null,
    createdAt: quote.createdAt.toISOString(),
  };

  return NextResponse.json({ quote: serialized });
}
