import { notFound } from "next/navigation";
import { getPublicProfile } from "@/lib/queries/user";
import {
  getDraftQuotesByUserForProfile,
  getPublishedQuotesByUser,
} from "@/lib/queries/quote";
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

  const [profile, quotes, drafts] = await Promise.all([
    getPublicProfile(userId),
    getPublishedQuotesByUser(userId),
    (() => {
      const canViewDrafts =
        !!session &&
        (session.user.id === userId || session.user.role === "admin");
      return canViewDrafts
        ? getDraftQuotesByUserForProfile(userId)
        : Promise.resolve([]);
    })(),
  ]);

  if (!profile) notFound();

  const isOwnProfile = !!session && session.user.id === userId;
  const canViewDraftQuotes =
    !!session && (session.user.id === userId || session.user.role === "admin");
  const canDeleteDraftQuotes = !!session && session.user.id === userId;

  return (
    <ProfileClient
      profile={profile}
      quotes={quotes}
      isOwnProfile={isOwnProfile}
      draftQuotes={drafts}
      canViewDraftQuotes={canViewDraftQuotes}
      canDeleteDraftQuotes={canDeleteDraftQuotes}
    />
  );
}
