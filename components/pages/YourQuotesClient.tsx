"use client";

import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  IN_REVIEW: "#2563eb",
  APPROVED: "#059669",
  PUBLISHED: "#7c3aed",
  REJECTED: "#dc2626",
};

interface YourQuotesQuote {
  id: string;
  text: string;
  attribution: string;
  socialHandles: string[];
  status: string;
  mood: string | null;
  colorPalette: string | null;
  createdAt: string;
  publishedAt: string | null;
}

interface YourQuotesClientProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  quotes: YourQuotesQuote[];
}

export default function YourQuotesClient({
  user,
  quotes,
}: YourQuotesClientProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-10 py-24 pt-32 max-lg:px-4 max-lg:pt-24 max-lg:pb-16">
        <h1 className="text-3xl font-light tracking-tight mb-2">
          Your Quotes
        </h1>
        <p className="text-sm text-foreground/50 mb-10">
          Track the status of your submissions, {user.name}.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          <div className="bg-[#F8F8F8] rounded-2xl p-5">
            <p className="text-2xl font-light">{quotes.length}</p>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mt-1">
              Total
            </p>
          </div>
          <div className="bg-[#F8F8F8] rounded-2xl p-5">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.PENDING }}
            >
              {quotes.filter((q) => q.status === "PENDING").length}
            </p>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mt-1">
              Pending
            </p>
          </div>
          <div className="bg-[#F8F8F8] rounded-2xl p-5">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.PUBLISHED }}
            >
              {quotes.filter((q) => q.status === "PUBLISHED").length}
            </p>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mt-1">
              Published
            </p>
          </div>
          <div className="bg-[#F8F8F8] rounded-2xl p-5">
            <p
              className="text-2xl font-light"
              style={{ color: STATUS_COLORS.REJECTED }}
            >
              {quotes.filter((q) => q.status === "REJECTED").length}
            </p>
            <p className="text-xs uppercase tracking-widest text-foreground/40 mt-1">
              Rejected
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-lg font-light">Your Submissions</h2>
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground bg-[#ECECEC] rounded-full py-3 px-5 no-underline transition-opacity hover:opacity-85"
          >
            Submit New
          </Link>
        </div>

        {/* Quotes list */}
        {quotes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-foreground/40 mb-4">No quotes submitted yet.</p>
            <Link
              href="/submit"
              className="text-foreground text-sm hover:underline"
            >
              Submit your first quote &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-[#F8F8F8] rounded-2xl p-5 flex gap-6 items-start hover:bg-[#f0f0f0] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-light leading-relaxed truncate">
                    &ldquo;{quote.text}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs text-foreground/40">
                      — {quote.attribution}
                    </span>
                    {quote.socialHandles?.map((handle, i) => (
                      <span key={i} className="text-xs text-foreground/30">
                        {handle}
                      </span>
                    ))}
                    {quote.mood && (
                      <span className="text-[0.65rem] uppercase tracking-wider text-foreground/25">
                        {quote.mood}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    className="text-[0.65rem] uppercase tracking-widest font-medium px-2 py-1 rounded-full"
                    style={{
                      color: STATUS_COLORS[quote.status] || "#999",
                      backgroundColor: `${STATUS_COLORS[quote.status] || "#999"}12`,
                    }}
                  >
                    {quote.status.replace("_", " ")}
                  </span>
                  <span className="text-[0.6rem] text-foreground/30">
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
