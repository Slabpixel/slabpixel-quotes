import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { updateQuoteStatusSchema } from "@/lib/validations/quote";
import { headers } from "next/headers";
import { PUBLISHED_QUOTES_FEED_TAG } from "@/lib/queries/quote";

// GET /api/dashboard/quotes/[id] — get full quote details for admin
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const quote = await prisma.quote.findUnique({
    where: { id },
    include: {
      submitter: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      curator: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  return NextResponse.json({ quote });
}

// PATCH /api/dashboard/quotes/[id] — update quote status / curate
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const result = updateQuoteStatusSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: "Validation failed", details: result.error.flatten() },
      { status: 400 },
    );
  }

  const existing = await prisma.quote.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const data = result.data;

  const quote = await prisma.quote.update({
    where: { id },
    data: {
      status: data.status,
      curatorId: session.user.id,
      designNotes: data.designNotes ?? existing.designNotes,
      cardImageUrl: data.cardImageUrl ?? existing.cardImageUrl,
      fontPrimary: data.fontPrimary ?? existing.fontPrimary,
      fontSecondary: data.fontSecondary ?? existing.fontSecondary,
      colorPalette: data.colorPalette ?? existing.colorPalette,
      publishedAt:
        data.status === "PUBLISHED" ? new Date() : existing.publishedAt,
    },
  });

  if (existing.status === "PUBLISHED" || data.status === "PUBLISHED") {
    revalidateTag(PUBLISHED_QUOTES_FEED_TAG, "max");
  }

  return NextResponse.json({ quote });
}

// DELETE /api/dashboard/quotes/[id] — delete a quote
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const existing = await prisma.quote.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  await prisma.quote.delete({ where: { id } });

  if (existing.status === "PUBLISHED") {
    revalidateTag(PUBLISHED_QUOTES_FEED_TAG, "max");
  }

  return NextResponse.json({ success: true });
}
