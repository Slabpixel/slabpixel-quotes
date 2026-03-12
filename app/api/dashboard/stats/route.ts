import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuoteStats } from "@/lib/queries/quote";

// GET /api/dashboard/stats — dashboard statistics
export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const stats = await getQuoteStats();
  return NextResponse.json(stats);
}
