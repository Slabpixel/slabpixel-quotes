import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/queries/user";
import { getPublishedQuotesByUser } from "@/lib/queries/quote";
import ProfileClient from "@/components/pages/ProfileClient";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function ProfileUserIdPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const session = await getSession();

  const [profile, quotes] = await Promise.all([
    getPublicProfile(userId),
    getPublishedQuotesByUser(userId),
  ]);

  if (!profile) notFound();

  const isOwnProfile = !!session && session.user.id === userId;

  return (
    <ProfileClient
      profile={profile}
      quotes={quotes}
      isOwnProfile={isOwnProfile}
    />
  );
}
