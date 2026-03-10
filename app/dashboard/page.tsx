import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import DashboardClient from "@/components/pages/DashboardClient";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/sign-in?callbackUrl=/dashboard");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const [quotes, stats] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submitter: {
          select: { id: true, name: true, email: true, image: true },
        },
        curator: {
          select: { id: true, name: true },
        },
      },
    }),
    Promise.all([
      prisma.quote.count(),
      prisma.quote.count({ where: { status: "PENDING" } }),
      prisma.quote.count({ where: { status: "IN_REVIEW" } }),
      prisma.quote.count({ where: { status: "PUBLISHED" } }),
      prisma.quote.count({ where: { status: "REJECTED" } }),
    ]).then(([total, pending, inReview, published, rejected]) => ({
      total,
      pending,
      inReview,
      published,
      rejected,
    })),
  ]);

  const serializedQuotes = quotes.map((q) => ({
    ...q,
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
    publishedAt: q.publishedAt?.toISOString() ?? null,
    socialHandles: Array.isArray(q.socialHandles) ? (q.socialHandles as string[]) : [],
  }));

  return <DashboardClient quotes={serializedQuotes} stats={stats} />;
}
