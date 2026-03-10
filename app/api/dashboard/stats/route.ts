import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// GET /api/dashboard/stats — dashboard statistics
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [total, pending, inReview, approved, published, rejected] =
    await Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "PENDING" } }),
      prisma.quote.count({ where: { status: "IN_REVIEW" } }),
      prisma.quote.count({ where: { status: "APPROVED" } }),
      prisma.quote.count({ where: { status: "PUBLISHED" } }),
      prisma.quote.count({ where: { status: "REJECTED" } }),
    ]);

  return NextResponse.json({
    total,
    pending,
    inReview,
    approved,
    published,
    rejected,
  });
}
