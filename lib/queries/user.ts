import { prisma } from "@/lib/db";
import type { PublicProfile } from "@/types/profile";

/** Get public profile by user id. Returns null if user not found. */
export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId, banned: false },
      select: {
        id: true,
        name: true,
        image: true,
        profilePhoto: true,
        bio: true,
      },
    });
    return user as PublicProfile | null;
  } catch {
    return null;
  }
}
