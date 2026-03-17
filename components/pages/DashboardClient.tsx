"use client";

import { useState } from "react";
import { BackToHome } from "@/components/BackToHome";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/constants/quote-status";
import StatusBadge from "@/components/StatusBadge";

interface DashboardQuote {
  id: string;
  text: string;
  attribution: string;
  socialHandles: string[];
  authorPhoto: string | null;
  fontPrimary: string | null;
  fontSecondary: string | null;
  colorPalette: string | null;
  mood: string | null;
  status: string;
  designNotes: string | null;
  cardImageUrl: string | null;
  curatorId: string | null;
  submitterId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  submitter: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  } | null;
  curator: {
    id: string;
    name: string;
  } | null;
}

interface DashboardStats {
  total: number;
  pending: number;
  inReview: number;
  approved: number;
  published: number;
  rejected: number;
}

interface DashboardClientProps {
  quotes: DashboardQuote[];
  stats: DashboardStats;
}

export default function DashboardClient({
  quotes: initialQuotes,
  stats,
}: DashboardClientProps) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [filter, setFilter] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredQuotes = filter
    ? quotes.filter((q) => q.status === filter)
    : quotes;

  const updateStatus = async (quoteId: string, status: string) => {
    setUpdatingId(quoteId);
    try {
      const res = await fetch(`/api/dashboard/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const { quote } = await res.json();
        setQuotes((prev) =>
          prev.map((q) =>
            q.id === quoteId
              ? { ...q, status: quote.status, publishedAt: quote.publishedAt }
              : q,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteQuote = async (quoteId: string) => {
    if (!confirm("Delete this quote permanently?")) return;

    try {
      const res = await fetch(`/api/dashboard/quotes/${quoteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      }
    } catch (err) {
      console.error("Failed to delete:", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-10 py-24 pt-32 max-lg:px-4 max-lg:pt-24 max-lg:pb-16">
        <BackToHome />
        <h1 className="text-3xl font-light tracking-tight mb-2">Dashboard</h1>
        <p className="text-sm text-foreground/50 mb-10">
          Manage and curate submitted quotes.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-10">
          {[
            { label: "Total", value: stats.total, color: "#111" },
            {
              label: "Pending",
              value: stats.pending,
              color: STATUS_COLORS.PENDING,
            },
            {
              label: "In Review",
              value: stats.inReview,
              color: STATUS_COLORS.IN_REVIEW,
            },
            {
              label: "Published",
              value: stats.published,
              color: STATUS_COLORS.PUBLISHED,
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: STATUS_COLORS.REJECTED,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#F8F8F8] rounded-2xl p-5"
            >
              <p className="text-2xl font-light" style={{ color: stat.color }}>
                {stat.value}
              </p>
              <p className="text-xs uppercase tracking-widest text-foreground/40 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
              filter === null
                ? "border-foreground bg-foreground text-background"
                : "border-foreground/15 text-foreground/50 hover:text-foreground hover:border-foreground/30"
            }`}
          >
            All ({quotes.length})
          </button>
          {STATUS_OPTIONS.map((s) => {
            const count = quotes.filter((q) => q.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setFilter(filter === s ? null : s)}
                className={`px-4 py-2 text-xs uppercase tracking-widest rounded-full border transition-all cursor-pointer ${
                  filter === s
                    ? "border-current"
                    : "border-foreground/15 text-foreground/50 hover:text-foreground hover:border-foreground/30"
                }`}
                style={
                  filter === s
                    ? { color: STATUS_COLORS[s], borderColor: STATUS_COLORS[s] }
                    : {}
                }
              >
                {s.replace("_", " ")} ({count})
              </button>
            );
          })}
        </div>

        {/* Quotes */}
        <div className="space-y-2">
          {filteredQuotes.map((quote) => (
            <div
              key={quote.id}
              className="bg-[#F8F8F8] rounded-2xl overflow-hidden hover:bg-[#f0f0f0] transition-colors"
            >
              {/* Summary row */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === quote.id ? null : quote.id)
                }
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor: STATUS_COLORS[quote.status] || "#999",
                  }}
                />

                <p className="flex-1 text-sm font-light truncate min-w-0">
                  &ldquo;{quote.text}&rdquo;
                </p>

                <span className="text-xs text-foreground/40 shrink-0">
                  — {quote.attribution}
                </span>

                <StatusBadge status={quote.status} className="shrink-0 text-[0.6rem] py-0.5" />
                <span className="text-[0.6rem] text-foreground/30 shrink-0">
                  {new Date(quote.createdAt).toLocaleDateString()}
                </span>
                <span className="text-foreground/30 text-xs">
                  {expandedId === quote.id ? "▲" : "▼"}
                </span>
              </div>

              {/* Expanded detail */}
              {expandedId === quote.id && (
                <div className="border-t border-foreground/5 px-5 py-5 space-y-4 bg-[#ebebeb]">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                        Attribution
                      </span>
                      <span>{quote.attribution}</span>
                    </div>
                    {quote.socialHandles?.length > 0 && (
                      <div>
                        <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                          Social
                        </span>
                        <span>{quote.socialHandles.join(", ")}</span>
                      </div>
                    )}
                    {quote.mood && (
                      <div>
                        <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                          Mood
                        </span>
                        <span>{quote.mood}</span>
                      </div>
                    )}
                    {quote.fontPrimary && (
                      <div>
                        <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                          Font
                        </span>
                        <span>{quote.fontPrimary}</span>
                      </div>
                    )}
                    {quote.submitter && (
                      <div>
                        <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                          Submitter
                        </span>
                        <span>
                          {quote.submitter.name} ({quote.submitter.email})
                        </span>
                      </div>
                    )}
                    {quote.curator && (
                      <div>
                        <span className="text-foreground/40 uppercase tracking-wider block mb-1">
                          Curated by
                        </span>
                        <span>{quote.curator.name}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm font-light leading-relaxed p-4 bg-white rounded-xl">
                    &ldquo;{quote.text}&rdquo;
                  </div>

                  {/* Status actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-foreground/40 uppercase tracking-wider mr-2">
                      Set Status:
                    </span>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        disabled={quote.status === s || updatingId === quote.id}
                        onClick={() => updateStatus(quote.id, s)}
                        className="px-3 py-1.5 text-[0.65rem] uppercase tracking-widest rounded-full border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                        style={
                          quote.status === s
                            ? {
                                color: STATUS_COLORS[s],
                                borderColor: STATUS_COLORS[s],
                              }
                            : {}
                        }
                      >
                        {s.replace("_", " ")}
                      </button>
                    ))}

                    <button
                      onClick={() => deleteQuote(quote.id)}
                      className="ml-auto px-3 py-1.5 text-[0.65rem] uppercase tracking-widest rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredQuotes.length === 0 && (
          <div className="text-center py-20">
            <p className="text-foreground/40">No quotes match this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
