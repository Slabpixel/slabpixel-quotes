import { NextRequest, NextResponse } from "next/server";
import { getPublicProfile } from "@/lib/queries/user";
import { getPublishedQuotesByUser } from "@/lib/queries/quote";

// GET /api/profile/[userId] — public profile + published quotes
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const { userId } = await params;
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const [profile, quotes] = await Promise.all([
    getPublicProfile(userId),
    getPublishedQuotesByUser(userId),
  ]);

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ profile, quotes });
}
