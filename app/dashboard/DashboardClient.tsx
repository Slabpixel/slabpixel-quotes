"use client";

import Link from "next/link";
import { signOut } from "@/lib/auth-client";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#facc15",
  IN_REVIEW: "#60a5fa",
  APPROVED: "#34d399",
  PUBLISHED: "#a78bfa",
  REJECTED: "#f87171",
};

interface DashboardQuote {
  id: string;
  text: string;
  attribution: string;
  socialHandle: string | null;
  status: string;
  mood: string | null;
  colorPalette: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface DashboardClientProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  quotes: DashboardQuote[];
}

export default function DashboardClient({
  user,
  quotes,
}: DashboardClientProps) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-8 py-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] hover:text-white transition-colors"
          >
            &larr; Grid
          </Link>
          <span className="text-[var(--border)]">/</span>
          <h1 className="text-sm font-medium uppercase tracking-[0.1em]">
            Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-[var(--muted)]">{user.email}</p>
          </div>
          {user.image && (
            <img
              src={user.image}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          )}
          <button
            onClick={() => signOut()}
            className="text-xs uppercase tracking-[0.1em] text-[var(--muted)] hover:text-white transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p className="text-2xl font-light">{quotes.length}</p>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
              Total
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.PENDING }}
            >
              {quotes.filter((q) => q.status === "PENDING").length}
            </p>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
              Pending
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.PUBLISHED }}
            >
              {quotes.filter((q) => q.status === "PUBLISHED").length}
            </p>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
              Published
            </p>
          </div>
          <div className="border border-[var(--border)] rounded-lg p-4">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.REJECTED }}
            >
              {quotes.filter((q) => q.status === "REJECTED").length}
            </p>
            <p className="text-xs uppercase tracking-[0.15em] text-[var(--muted)] mt-1">
              Rejected
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-light">Your Submissions</h2>
          <Link
            href="/submit"
            className="px-5 py-2.5 text-xs uppercase tracking-[0.15em] bg-white text-[var(--background)] rounded-lg hover:bg-white/90 transition-colors"
          >
            Submit New
          </Link>
        </div>

        {/* Quotes list */}
        {quotes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--muted)] mb-4">No quotes submitted yet.</p>
            <Link
              href="/submit"
              className="text-[var(--accent)] text-sm hover:underline"
            >
              Submit your first quote &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="border border-[var(--border)] rounded-lg p-5 flex gap-6 items-start hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light leading-relaxed truncate">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-[var(--muted)]">
                      — {quote.attribution}
                    </span>
                    {quote.socialHandle && (
                      <span className="text-xs text-[var(--muted)] opacity-50">
                        {quote.socialHandle}
                      </span>
                    )}
                    {quote.mood && (
                      <span className="text-[0.65rem] uppercase tracking-wider text-[var(--muted)] opacity-40">
                        {quote.mood}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-[0.65rem] uppercase tracking-[0.15em] font-medium px-2 py-1 rounded"
                    style={{
                      color: STATUS_COLORS[quote.status] || "#999",
                      backgroundColor: `${STATUS_COLORS[quote.status] || "#999"}15`,
                    }}
                  >
                    {quote.status.replace("_", " ")}
                  </span>
                  <span className="text-[0.6rem] text-[var(--muted)]">
                    {new Date(quote.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
