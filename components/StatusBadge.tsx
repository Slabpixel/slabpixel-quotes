"use client";

import { STATUS_COLORS } from "@/lib/constants/quote-status";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

/** Reusable status badge with consistent colors. */
export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const color = STATUS_COLORS[status] ?? "#999";
  const prettyStatus = status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <span
      className={`text-[0.65rem] tracking-normal font-medium px-2 py-1 rounded-full ${className}`}
      style={{
        color,
        backgroundColor: `${color}12`,
      }}
    >
      {prettyStatus}
    </span>
  );
}
