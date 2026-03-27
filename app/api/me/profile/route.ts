import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

// PATCH /api/me/profile — update current user's profile
export async function PATCH(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { bio?: string; name?: string; profilePhoto?: string | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name =
    typeof body.name === "string"
      ? body.name.slice(0, 100).trim()
      : session.user.name;
  const bio =
    typeof body.bio === "string"
      ? body.bio.slice(0, 500).trim() || null
      : null;
  const profilePhoto =
    typeof body.profilePhoto === "string"
      ? body.profilePhoto.slice(0, 2048).trim() || null
      : body.profilePhoto === null
        ? null
        : undefined;

  if (!name) {
    return NextResponse.json(
      { error: "Name cannot be empty" },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio,
      ...(profilePhoto !== undefined ? { profilePhoto } : {}),
    },
  });

  return NextResponse.json({ name, bio, profilePhoto: profilePhoto ?? null });
}
