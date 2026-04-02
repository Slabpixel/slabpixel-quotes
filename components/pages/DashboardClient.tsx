"use client";

import { Fragment, useState } from "react";
import { BackToHome } from "@/components/BackToHome";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/constants/quote-status";
import StatusBadge from "@/components/StatusBadge";
import { cn } from "@/lib/cn";
import { getCardPaletteStyle } from "@/lib/quote-presets";
import { resolveQuoteBackground } from "@/lib/quote-background";
import { useGoogleFont } from "@/lib/use-google-font";

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform text-foreground/60", open && "rotate-180")}
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.59 13.41L11 3H4v7l10.59 9.59a2 2 0 002.82 0l3.18-3.18a2 2 0 000-2.82z" />
      <path d="M7.5 7.5h.01" />
    </svg>
  );
}

function StatIcon({ kind, className }: { kind: string; className?: string }) {
  const common = cn("text-foreground/70", className);
  switch (kind) {
    case "total":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <path d="M12 2l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      );
    case "pending":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <path d="M5 3h14" />
          <path d="M7 7h10" />
          <path d="M12 7v7l3 3" />
          <path d="M8 14l4 4 4-4" opacity="0.25" />
        </svg>
      );
    case "review":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
          <path d="M8.7 10.8h4.6" />
        </svg>
      );
    case "published":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case "rejected":
      return (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={common}
          aria-hidden="true"
        >
          <path d="M18 6L6 18" />
          <path d="M6 6l12 12" />
        </svg>
      );
    default:
      return null;
  }
}

/** Matches `ProfileQuoteCard` outer + inner card (Home feed uses the same palette/bg pattern). */
function DashboardQuotePreview({
  quote,
  index,
}: {
  quote: {
    text: string;
    attribution: string;
    backgroundId: string | null;
    backgroundUrl: string | null;
    fontPrimary: string | null;
    colorPalette: string | null;
  };
  index: number;
}) {
  useGoogleFont(quote.fontPrimary);
  const bgResolved = resolveQuoteBackground({
    backgroundId: quote.backgroundId,
    backgroundUrl: quote.backgroundUrl,
  });

  return (
    <div
      className={cn(
        "rounded-4xl h-full relative flex items-center justify-center min-h-[440px] overflow-hidden p-8",
        "max-md:p-6 max-sm:min-h-[260px]",
        bgResolved.type === "none" ? "bg-[#ebebeb]" : "",
      )}
      style={
        bgResolved.type === "preset" || bgResolved.type === "custom"
          ? {
              backgroundImage: `url(${bgResolved.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : bgResolved.type === "solid"
            ? { backgroundColor: bgResolved.color }
            : undefined
      }
    >
      {(bgResolved.type === "preset" || bgResolved.type === "custom") && (
        <div className="absolute inset-0 bg-black/22 rounded-[inherit]" />
      )}

      <div className="relative z-10 w-full flex items-center justify-center">
        <div
          className="group relative z-1 bg-card-bg text-card-text rounded-4xl p-4 max-w-97 w-full flex flex-col justify-between min-h-69 gap-4"
          style={{
            ...getCardPaletteStyle(quote, index),
            fontFamily: quote.fontPrimary
              ? `"${quote.fontPrimary}", serif`
              : undefined,
          }}
        >
          <div className="flex flex-col gap-4 w-full">
            <blockquote className="text-lg font-medium leading-1.4 m-0">
              {quote.text}
            </blockquote>
            <cite className="text-sm text-card-accent not-italic block">
              {quote.attribution}
            </cite>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DashboardQuote {
  id: string;
  text: string;
  attribution: string;
  socialHandles: string[];
  authorPhoto: string | null;
  backgroundId: string | null;
  backgroundUrl: string | null;
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
  const formatStatusLabel = (s: string) =>
    s
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

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
            { label: "Total", value: stats.total, color: "#111", icon: "total" },
            {
              label: "Pending",
              value: stats.pending,
              color: STATUS_COLORS.PENDING,
              icon: "pending",
            },
            {
              label: "In Review",
              value: stats.inReview,
              color: STATUS_COLORS.IN_REVIEW,
              icon: "review",
            },
            {
              label: "Published",
              value: stats.published,
              color: STATUS_COLORS.PUBLISHED,
              icon: "published",
            },
            {
              label: "Rejected",
              value: stats.rejected,
              color: STATUS_COLORS.REJECTED,
              icon: "rejected",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card-bg rounded-2xl p-5 border border-border"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <StatIcon kind={stat.icon} />
                </div>
                <div className="min-w-0">
                  <p
                    className="text-2xl font-light tracking-tight"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </p>
                  <p className="text-xs font-medium text-foreground/40 mt-1 tracking-normal">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 text-xs font-medium tracking-normal rounded-full border transition-all cursor-pointer ${
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
                className={`px-4 py-2 text-xs font-medium tracking-normal rounded-full border transition-all cursor-pointer ${
                  filter === s
                    ? "border-foreground/15 text-foreground"
                    : "border-foreground/15 text-foreground/50 hover:text-foreground hover:border-foreground/30"
                }`}
                style={
                  filter === s
                    ? {
                        color: STATUS_COLORS[s],
                        borderColor: STATUS_COLORS[s],
                        backgroundColor: `${STATUS_COLORS[s]}12`,
                      }
                    : {}
                }
              >
                {formatStatusLabel(s)} ({count})
              </button>
            );
          })}
        </div>

        {/* Quotes */}
        <div className="overflow-x-auto">
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-foreground/40">No quotes match this filter.</p>
            </div>
          ) : (
            <table className="w-full table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-foreground/50 tracking-normal px-5 py-3 border-b border-border w-[420px] max-w-[560px]">
                    Quote
                  </th>
                  <th className="text-left text-xs font-medium text-foreground/50 tracking-normal px-5 py-3 border-b border-border hidden md:table-cell">
                    Submitter
                  </th>
                  <th className="text-left text-xs font-medium text-foreground/50 tracking-normal px-5 py-3 border-b border-border">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-foreground/50 tracking-normal px-5 py-3 border-b border-border hidden lg:table-cell">
                    Date
                  </th>
                  <th className="w-16 px-5 py-3 border-b border-border" />
                </tr>
              </thead>

              <tbody>
                {filteredQuotes.map((quote, index) => {
                  const isExpanded = expandedId === quote.id;

                  return (
                    <Fragment key={quote.id}>
                      <tr className="align-top hover:bg-card-bg/60 transition-colors">
                      <td className="px-5 py-4 border-b border-border/50 w-[420px] max-w-[420px]">
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-relaxed truncate">
                              &ldquo;{quote.text}&rdquo;
                            </p>
                            <p className="text-xs text-foreground/40 font-medium mt-1 truncate">
                              — {quote.attribution}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 border-b border-border/50 hidden md:table-cell">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {quote.submitter?.name ?? "—"}
                            </p>
                            <p className="text-xs text-foreground/40 font-medium truncate">
                              {quote.submitter?.email ?? ""}
                            </p>
                          </div>
                        </td>

                        <td className="px-5 py-4 border-b border-border/50">
                          <StatusBadge
                            status={quote.status}
                            className="text-[0.65rem] py-1"
                          />
                        </td>

                        <td className="px-5 py-4 border-b border-border/50 hidden lg:table-cell">
                          <span className="text-xs text-foreground/40 font-medium">
                            {formatDate(quote.createdAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4 border-b border-border/50">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedId(isExpanded ? null : quote.id)
                            }
                            className="inline-flex items-center justify-center rounded-full border border-border bg-background/40 hover:bg-background transition-colors h-9 w-9 cursor-pointer"
                            aria-label={
                              isExpanded ? "Collapse details" : "Expand details"
                            }
                          >
                            <ChevronDownIcon open={isExpanded} />
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-5 border-b border-border/50"
                          >
                            <div className="rounded-4xl border border-border bg-background p-5">
                              <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-5">
                                <div className="min-w-0">
                                  <DashboardQuotePreview quote={quote} index={index} />
                                </div>

                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                      <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                        Attribution
                                      </span>
                                      <span className="font-medium">{quote.attribution}</span>
                                    </div>

                                    {quote.socialHandles?.length ? (
                                      <div className="col-span-2">
                                        <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                          Social
                                        </span>
                                        <span className="font-medium">
                                          {quote.socialHandles.join(", ")}
                                        </span>
                                      </div>
                                    ) : null}

                                    {quote.mood ? (
                                      <div>
                                        <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                          Mood
                                        </span>
                                        <span className="font-medium">{quote.mood}</span>
                                      </div>
                                    ) : null}

                                    {quote.fontPrimary ? (
                                      <div>
                                        <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                          Font
                                        </span>
                                        <span className="font-medium">{quote.fontPrimary}</span>
                                      </div>
                                    ) : null}

                                    {quote.submitter ? (
                                      <div className="col-span-2">
                                        <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                          Submitter
                                        </span>
                                        <span className="font-medium">
                                          {quote.submitter.name} ({quote.submitter.email})
                                        </span>
                                      </div>
                                    ) : null}

                                    {quote.curator ? (
                                      <div className="col-span-2">
                                        <span className="text-foreground/40 tracking-normal font-medium block mb-1">
                                          Curated by
                                        </span>
                                        <span className="font-medium">{quote.curator.name}</span>
                                      </div>
                                    ) : null}
                                  </div>

                                  <div className="pt-2">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground/40">
                                        <TagIcon className="text-foreground/50" />
                                        Set Status
                                      </span>

                                      {STATUS_OPTIONS.map((s) => {
                                        const isSame = quote.status === s;
                                        const color = STATUS_COLORS[s];

                                        return (
                                          <button
                                            key={s}
                                            type="button"
                                            disabled={
                                              isSame || updatingId === quote.id
                                            }
                                            onClick={() =>
                                              updateStatus(quote.id, s)
                                            }
                                            className="px-3 py-1.5 text-[0.65rem] font-medium tracking-normal rounded-full border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
                                            style={
                                              isSame
                                                ? {
                                                    color,
                                                    borderColor: color,
                                                    backgroundColor: `${color}12`,
                                                  }
                                                : undefined
                                            }
                                          >
                                            {formatStatusLabel(s)}
                                          </button>
                                        );
                                      })}

                                      <button
                                        type="button"
                                        onClick={() => deleteQuote(quote.id)}
                                        className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 text-[0.65rem] font-medium tracking-normal rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                                      >
                                        <TrashIcon className="text-current/80" />
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
