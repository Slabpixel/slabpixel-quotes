import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/me/profile — update current user's bio
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bio?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const bio =
    typeof body.bio === "string"
      ? body.bio.slice(0, 500).trim() || null
      : null;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bio },
  });

  return NextResponse.json({ bio });
}
