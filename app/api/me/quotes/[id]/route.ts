import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// DELETE /api/me/quotes/[id] — delete a user's draft (non-published) quote
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.quote.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  const isOwner = existing.submitterId === session.user.id;
  const isAdmin = session.user.role === "admin";
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Published quotes must be removed via admin dashboard settings.
  if (existing.status === "PUBLISHED") {
    return NextResponse.json(
      { error: "Published quotes can only be deleted by admin dashboard." },
      { status: 403 },
    );
  }

  await prisma.quote.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

