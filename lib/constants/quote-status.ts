/**
 * Quote status constants for UI (badges, filters, stats).
 * Shared by DashboardClient, YourQuotesClient, and any status-aware components.
 */

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "#d97706",
  IN_REVIEW: "#2563eb",
  APPROVED: "#059669",
  PUBLISHED: "#7c3aed",
  REJECTED: "#dc2626",
};

export const STATUS_OPTIONS = [
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "REJECTED",
] as const;

export type QuoteStatusOption = (typeof STATUS_OPTIONS)[number];
